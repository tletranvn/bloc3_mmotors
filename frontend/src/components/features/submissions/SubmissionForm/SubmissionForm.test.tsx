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

const mockVehicleSale: Vehicle = {
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

const mockVehicleRental: Vehicle = {
  ...mockVehicleSale,
  '@id': '/api/vehicles/2',
  id: 2,
  salePrice: null,
  rentalPriceMonthly: '350',
  availabilityType: 'RENTAL',
}

const mockUser = {
  id: 1,
  email: 'jean@email.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  phone: '0612345678',
  roles: ['ROLE_USER'],
}

const mockSubmissionSale = {
  id: 42,
  type: 'SALE',
  status: 'PENDING',
  profession: 'Ingénieur',
  monthlyIncome: '3500',
  monthlyTotal: null,
  duration: null,
  annualKm: null,
  createdAt: '2026-04-29T10:00:00Z',
}

const mockSubmissionRental = {
  id: 43,
  type: 'RENTAL',
  status: 'PENDING',
  profession: 'Ingénieur',
  monthlyIncome: '3500',
  monthlyTotal: '350.00',
  duration: 36,
  annualKm: 10000,
  createdAt: '2026-04-29T10:00:00Z',
}

const mockDocument = {
  id: 1,
  documentType: 'IDENTITY',
  documentUrl: 'https://cloudinary.com/doc.pdf',
  uploadedAt: '2026-04-29T10:00:00Z',
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

function renderForm(type: 'SALE' | 'RENTAL' = 'SALE', vehicle: Vehicle = mockVehicleSale) {
  return render(
    <MemoryRouter>
      <SubmissionForm vehicle={vehicle} type={type} />
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

  it('affiche 2 boutons d\'upload pour type=SALE', () => {
    renderForm('SALE')
    expect(screen.getAllByText(/choisir un fichier/i)).toHaveLength(2)
  })

  it('affiche "Aucun fichier sélectionné" par défaut (SALE)', () => {
    renderForm()
    expect(screen.getAllByText(/aucun fichier sélectionné/i)).toHaveLength(2)
  })

  it('affiche le nom du fichier après sélection', async () => {
    const user = userEvent.setup()
    renderForm()

    const file = new File(['content'], 'identite.pdf', { type: 'application/pdf' })
    const inputs = document.querySelectorAll('input[type="file"]')
    await user.upload(inputs[0] as HTMLElement, file)

    expect(screen.getByText('identite.pdf')).toBeInTheDocument()
  })

  it('soumet le dossier SALE et redirige avec message de succès', async () => {
    const user = userEvent.setup()

    vi.spyOn(submissionService, 'createSubmission').mockResolvedValue(mockSubmissionSale)
    vi.spyOn(submissionService, 'uploadDocument').mockResolvedValue(mockDocument)

    renderForm()

    await user.type(screen.getByLabelText(/profession/i), 'Ingénieur')
    await user.type(screen.getByLabelText(/revenus mensuels/i), '3500')

    const inputs = document.querySelectorAll('input[type="file"]')
    await user.upload(inputs[0] as HTMLElement, new File(['id'], 'identite.pdf', { type: 'application/pdf' }))
    await user.upload(inputs[1] as HTMLElement, new File(['adresse'], 'domicile.pdf', { type: 'application/pdf' }))

    await user.click(screen.getByRole('button', { name: /soumettre/i }))

    await waitFor(() => {
      expect(submissionService.createSubmission).toHaveBeenCalledWith('fake-token', {
        vehicleIri: '/api/vehicles/1',
        type: 'SALE',
        profession: 'Ingénieur',
        monthlyIncome: '3500',
      })
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

    const inputs = document.querySelectorAll('input[type="file"]')
    await user.upload(inputs[0] as HTMLElement, new File(['id'], 'identite.pdf', { type: 'application/pdf' }))
    await user.upload(inputs[1] as HTMLElement, new File(['adresse'], 'domicile.pdf', { type: 'application/pdf' }))

    await user.click(screen.getByRole('button', { name: /soumettre/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Vous avez déjà déposé un dossier pour ce véhicule.')
  })

  // --- Tests spécifiques RENTAL ---

  it('affiche les selects durée et kilométrage pour type=RENTAL', () => {
    renderForm('RENTAL', mockVehicleRental)
    expect(screen.getByLabelText(/durée/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/kilométrage annuel/i)).toBeInTheDocument()
  })

  it('affiche 6 boutons d\'upload pour type=RENTAL', () => {
    renderForm('RENTAL', mockVehicleRental)
    expect(screen.getAllByText(/choisir un fichier/i)).toHaveLength(6)
  })

  it('affiche le loyer calculé en temps réel (36 mois / 10K km = prix de base)', () => {
    renderForm('RENTAL', mockVehicleRental)
    // 350 × 1.00 + 0 = 350 €
    expect(screen.getByText(/loyer mensuel estimé/i)).toBeInTheDocument()
    expect(screen.getByText(/350/)).toBeInTheDocument()
  })

  it('met à jour le loyer quand la durée change', async () => {
    const user = userEvent.setup()
    renderForm('RENTAL', mockVehicleRental)

    const durationSelect = screen.getByLabelText(/durée/i)
    await user.selectOptions(durationSelect, '24')

    // 350 × 1.10 + 0 = 385 €
    expect(screen.getByText(/385/)).toBeInTheDocument()
  })

  it('met à jour le loyer quand le kilométrage change', async () => {
    const user = userEvent.setup()
    renderForm('RENTAL', mockVehicleRental)

    const kmSelect = screen.getByLabelText(/kilométrage annuel/i)
    await user.selectOptions(kmSelect, '15000')

    // 350 × 1.00 + 15 = 365 €
    expect(screen.getByText(/365/)).toBeInTheDocument()
  })

  it('le bouton Soumettre est désactivé si un document RENTAL manque', () => {
    renderForm('RENTAL', mockVehicleRental)
    expect(screen.getByRole('button', { name: /soumettre/i })).toBeDisabled()
  })

  it('soumet le dossier RENTAL avec duration, annualKm et monthlyTotal', async () => {
    const user = userEvent.setup()

    vi.spyOn(submissionService, 'createSubmission').mockResolvedValue(mockSubmissionRental)
    vi.spyOn(submissionService, 'uploadDocument').mockResolvedValue(mockDocument)

    renderForm('RENTAL', mockVehicleRental)

    await user.type(screen.getByLabelText(/profession/i), 'Ingénieur')
    await user.type(screen.getByLabelText(/revenus mensuels/i), '3500')

    const inputs = document.querySelectorAll('input[type="file"]')
    const pdf = (name: string) => new File(['content'], name, { type: 'application/pdf' })
    await user.upload(inputs[0] as HTMLElement, pdf('identite.pdf'))
    await user.upload(inputs[1] as HTMLElement, pdf('domicile.pdf'))
    await user.upload(inputs[2] as HTMLElement, pdf('rib.pdf'))
    await user.upload(inputs[3] as HTMLElement, pdf('salaire1.pdf'))
    await user.upload(inputs[4] as HTMLElement, pdf('salaire2.pdf'))
    await user.upload(inputs[5] as HTMLElement, pdf('salaire3.pdf'))

    await user.click(screen.getByRole('button', { name: /soumettre/i }))

    await waitFor(() => {
      expect(submissionService.createSubmission).toHaveBeenCalledWith('fake-token', {
        vehicleIri: '/api/vehicles/2',
        type: 'RENTAL',
        profession: 'Ingénieur',
        monthlyIncome: '3500',
        duration: 36,
        annualKm: 10000,
        monthlyTotal: '350.00',
        services: [],
      })
      // 2 docs communs + RIB + 3 bulletins = 6 uploads
      expect(submissionService.uploadDocument).toHaveBeenCalledTimes(6)
    })
  })

})
