import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SubmissionsList from './SubmissionsList'
import * as useSubmissionsModule from '../../hooks/useSubmissions'
import type { Submission } from '../../services/api/submissionService'

vi.mock('../../hooks/useSubmissions')
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ token: 'fake-token', isAuthenticated: true, isLoading: false, user: null, login: vi.fn(), logout: vi.fn(), updateUser: vi.fn() }),
}))

const mockUseSubmissions = vi.mocked(useSubmissionsModule.useSubmissions)

const mockSaleSubmission: Submission = {
  id: 10,
  type: 'SALE',
  status: 'PENDING',
  profession: 'Ingénieur',
  monthlyIncome: '3500',
  monthlyTotal: null,
  duration: null,
  annualKm: null,
  rejectionReason: null,
  createdAt: '2026-04-01T10:00:00Z',
  vehicle: { '@id': '/api/vehicles/1', id: 1, brand: 'Renault', model: 'Clio', year: 2022, imageUrl: null },
  documents: [],
}

const mockRentalSubmission: Submission = {
  id: 11,
  type: 'RENTAL',
  status: 'APPROVED',
  profession: 'Médecin',
  monthlyIncome: '5000',
  monthlyTotal: '385.00',
  duration: 36,
  annualKm: 15000,
  rejectionReason: null,
  createdAt: '2026-04-15T10:00:00Z',
  vehicle: { '@id': '/api/vehicles/2', id: 2, brand: 'Peugeot', model: '308', year: 2023, imageUrl: 'https://example.com/car.jpg' },
  documents: [],
}

function renderPage(url = '/dashboard/submissions') {
  return render(<MemoryRouter initialEntries={[url]}><SubmissionsList /></MemoryRouter>)
}

beforeEach(() => {
  mockUseSubmissions.mockReturnValue({ data: [], isLoading: false, isError: false } as unknown as ReturnType<typeof useSubmissionsModule.useSubmissions>)
})

describe('SubmissionsList', () => {

  it('affiche "Chargement..." pendant le chargement', () => {
    mockUseSubmissions.mockReturnValue({ data: undefined, isLoading: true, isError: false } as unknown as ReturnType<typeof useSubmissionsModule.useSubmissions>)
    renderPage()
    expect(screen.getByText(/chargement/i)).toBeInTheDocument()
  })

  it('affiche un message d\'erreur en cas d\'échec', () => {
    mockUseSubmissions.mockReturnValue({ data: undefined, isLoading: false, isError: true } as unknown as ReturnType<typeof useSubmissionsModule.useSubmissions>)
    renderPage()
    expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument()
  })

  it('affiche l\'état vide quand aucun dossier', () => {
    renderPage()
    expect(screen.getByText(/vous n'avez pas encore de dossier/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /chercher un véhicule/i })).toBeInTheDocument()
  })

  it('affiche le titre "Mes dossiers"', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mes dossiers')
  })

  it('affiche un dossier avec marque, modèle, type et statut', () => {
    mockUseSubmissions.mockReturnValue({ data: [mockSaleSubmission], isLoading: false, isError: false } as unknown as ReturnType<typeof useSubmissionsModule.useSubmissions>)
    renderPage()
    expect(screen.getByText('Renault Clio')).toBeInTheDocument()
    expect(screen.getByText('Achat')).toBeInTheDocument()
    expect(screen.getByText('En attente')).toBeInTheDocument()
  })

  it('affiche le lien "Voir" pointant vers le bon détail', () => {
    mockUseSubmissions.mockReturnValue({ data: [mockSaleSubmission], isLoading: false, isError: false } as unknown as ReturnType<typeof useSubmissionsModule.useSubmissions>)
    renderPage()
    const link = screen.getByRole('link', { name: /voir/i })
    expect(link).toHaveAttribute('href', '/dashboard/submissions/10')
  })

  it('affiche plusieurs dossiers', () => {
    mockUseSubmissions.mockReturnValue({ data: [mockSaleSubmission, mockRentalSubmission], isLoading: false, isError: false } as unknown as ReturnType<typeof useSubmissionsModule.useSubmissions>)
    renderPage()
    expect(screen.getByText('Renault Clio')).toBeInTheDocument()
    expect(screen.getByText('Peugeot 308')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /voir/i })).toHaveLength(2)
  })

  it('affiche l\'image du véhicule quand disponible', () => {
    mockUseSubmissions.mockReturnValue({ data: [mockRentalSubmission], isLoading: false, isError: false } as unknown as ReturnType<typeof useSubmissionsModule.useSubmissions>)
    renderPage()
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/car.jpg')
  })

  it('affiche le lien "Retour à Mon espace"', () => {
    renderPage()
    const link = screen.getByRole('link', { name: /retour à mon espace/i })
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('filtre les dossiers par statut PENDING via query param', () => {
    mockUseSubmissions.mockReturnValue({ data: [mockSaleSubmission, mockRentalSubmission], isLoading: false, isError: false } as unknown as ReturnType<typeof useSubmissionsModule.useSubmissions>)
    renderPage('/dashboard/submissions?status=PENDING')
    expect(screen.getByText('Renault Clio')).toBeInTheDocument()
    expect(screen.queryByText('Peugeot 308')).not.toBeInTheDocument()
  })

  it('filtre les dossiers par statut APPROVED via query param', () => {
    mockUseSubmissions.mockReturnValue({ data: [mockSaleSubmission, mockRentalSubmission], isLoading: false, isError: false } as unknown as ReturnType<typeof useSubmissionsModule.useSubmissions>)
    renderPage('/dashboard/submissions?status=APPROVED')
    expect(screen.queryByText('Renault Clio')).not.toBeInTheDocument()
    expect(screen.getByText('Peugeot 308')).toBeInTheDocument()
  })

  it('affiche "Voir tous les dossiers" quand un filtre est actif', () => {
    mockUseSubmissions.mockReturnValue({ data: [mockSaleSubmission], isLoading: false, isError: false } as unknown as ReturnType<typeof useSubmissionsModule.useSubmissions>)
    renderPage('/dashboard/submissions?status=PENDING')
    expect(screen.getByRole('link', { name: /voir tous les dossiers/i })).toBeInTheDocument()
  })

  it('n\'affiche pas "Voir tous les dossiers" sans filtre actif', () => {
    mockUseSubmissions.mockReturnValue({ data: [mockSaleSubmission], isLoading: false, isError: false } as unknown as ReturnType<typeof useSubmissionsModule.useSubmissions>)
    renderPage()
    expect(screen.queryByRole('link', { name: /voir tous les dossiers/i })).not.toBeInTheDocument()
  })

})
