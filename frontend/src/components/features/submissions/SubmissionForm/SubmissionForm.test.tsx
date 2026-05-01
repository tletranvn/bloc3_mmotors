import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SubmissionForm from './SubmissionForm'
import * as useAuthModule from '../../../../hooks/useAuth'
import * as submissionService from '../../../../services/api/submissionService'
import type { Vehicle } from '../../../../services/api/vehicleService'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../../../services/api/submissionService')
vi.mock('../../../../hooks/useAuth')

const mockVehicle: Vehicle = {
  '@id': '/api/vehicles/1',
  '@type': 'Vehicle',
  id: 1,
  brand: 'Toyota',
  model: 'Yaris',
  year: 2022,
  mileage: 10000,
  salePrice: '15000',
  rentalPriceMonthly: null,
  status: 'AVAILABLE',
  availabilityType: 'SALE',
  fuelType: 'GASOLINE',
  color: null,
  imageUrl: null,
  description: null,
  createdAt: '2026-01-01T00:00:00Z',
}

const mockUser = {
  id: 1,
  email: 'jean@email.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  phone: '0612345678',
  roles: ['ROLE_USER'],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    user: mockUser,
    token: 'fake-token',
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  })
})

function renderForm(type: 'SALE' | 'RENTAL' = 'SALE') {
  return render(
    <MemoryRouter>
      <SubmissionForm vehicle={mockVehicle} type={type} />
    </MemoryRouter>
  )
}

describe('SubmissionForm', () => {

  it('affiche les champs readonly préremplis depuis useAuth', () => {
    renderForm()
    expect(screen.getByDisplayValue('Jean')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Dupont')).toBeInTheDocument()
    expect(screen.getByDisplayValue('jean@email.com')).toBeInTheDocument()

    const readonlyInputs = screen.getAllByRole('textbox').filter(
      (el) => el.getAttribute('readonly') !== null || el.getAttribute('readOnly') !== null
    )
    expect(readonlyInputs.length).toBeGreaterThan(0)
  })

  it('affiche les champs profession et revenus mensuels', () => {
    renderForm()
    expect(screen.getByLabelText(/profession/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/revenus mensuels/i)).toBeInTheDocument()
  })

  it('le bouton Soumettre est désactivé si les champs sont vides', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /soumettre/i })).toBeDisabled()
  })

  it('affiche les 2 boutons d\'upload de fichiers en français', () => {
    renderForm()
    const buttons = screen.getAllByText(/choisir un fichier/i)
    expect(buttons).toHaveLength(2)
  })

  it('affiche "Aucun fichier sélectionné" par défaut', () => {
    renderForm()
    const messages = screen.getAllByText(/aucun fichier sélectionné/i)
    expect(messages).toHaveLength(2)
  })

  it('affiche le nom du fichier après sélection', async () => {
    const user = userEvent.setup()
    renderForm()

    const file = new File(['content'], 'identite.pdf', { type: 'application/pdf' })
    const inputs = document.querySelectorAll('input[type="file"]')
    await user.upload(inputs[0] as HTMLElement, file)

    expect(screen.getByText('identite.pdf')).toBeInTheDocument()
  })

  it('soumet le dossier et redirige vers /dashboard avec message de succès', async () => {
    const user = userEvent.setup()

    vi.spyOn(submissionService, 'createSubmission').mockResolvedValue({
      id: 42,
      type: 'SALE',
      status: 'PENDING',
      profession: 'Ingénieur',
      monthlyIncome: '3500',
      createdAt: '2026-04-29T10:00:00Z',
    })
    vi.spyOn(submissionService, 'uploadDocument').mockResolvedValue({
      id: 1,
      documentType: 'IDENTITY',
      documentUrl: 'https://cloudinary.com/doc.pdf',
      uploadedAt: '2026-04-29T10:00:00Z',
    })

    renderForm()

    await user.type(screen.getByLabelText(/profession/i), 'Ingénieur')
    await user.type(screen.getByLabelText(/revenus mensuels/i), '3500')

    const identityFile = new File(['id'], 'identite.pdf', { type: 'application/pdf' })
    const addressFile = new File(['adresse'], 'domicile.pdf', { type: 'application/pdf' })
    const inputs = document.querySelectorAll('input[type="file"]')
    await user.upload(inputs[0] as HTMLElement, identityFile)
    await user.upload(inputs[1] as HTMLElement, addressFile)

    await user.click(screen.getByRole('button', { name: /soumettre/i }))

    await waitFor(() => {
      expect(submissionService.createSubmission).toHaveBeenCalledWith(
        'fake-token',
        '/api/vehicles/1',
        'SALE',
        'Ingénieur',
        '3500',
      )
      expect(submissionService.uploadDocument).toHaveBeenCalledTimes(2)
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/submissions', expect.objectContaining({
        state: expect.objectContaining({ successMessage: expect.any(String) }),
      }))
    })
  })

  it('affiche un message d\'erreur si la soumission échoue', async () => {
    const user = userEvent.setup()

    vi.spyOn(submissionService, 'createSubmission').mockRejectedValue({
      isAxiosError: true,
      response: { data: { detail: 'Vous avez déjà déposé un dossier pour ce véhicule.' } },
    })

    renderForm()

    await user.type(screen.getByLabelText(/profession/i), 'Ingénieur')
    await user.type(screen.getByLabelText(/revenus mensuels/i), '3500')

    const identityFile = new File(['id'], 'identite.pdf', { type: 'application/pdf' })
    const addressFile = new File(['adresse'], 'domicile.pdf', { type: 'application/pdf' })
    const inputs = document.querySelectorAll('input[type="file"]')
    await user.upload(inputs[0] as HTMLElement, identityFile)
    await user.upload(inputs[1] as HTMLElement, addressFile)

    await user.click(screen.getByRole('button', { name: /soumettre/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Vous avez déjà déposé un dossier pour ce véhicule.')
  })

})
