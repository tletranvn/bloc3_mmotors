import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SubmissionDetail from './SubmissionDetail'
import * as useSubmissionModule from '../../hooks/useSubmission'
import type { Submission } from '../../services/api/submissionService'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useParams: () => ({ id: '5' }) }
})

vi.mock('../../hooks/useSubmission')
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ token: 'fake-token', isAuthenticated: true, isLoading: false, user: null, login: vi.fn(), logout: vi.fn(), updateUser: vi.fn() }),
}))

const mockUseSubmission = vi.mocked(useSubmissionModule.useSubmission)

const mockSaleSubmission: Submission = {
  id: 5,
  type: 'SALE',
  status: 'PENDING',
  profession: 'Ingénieur',
  monthlyIncome: '3500.00',
  monthlyTotal: null,
  duration: null,
  annualKm: null,
  rejectionReason: null,
  createdAt: '2026-04-01T10:00:00Z',
  vehicle: { '@id': '/api/vehicles/1', id: 1, brand: 'Toyota', model: 'Yaris', year: 2022, imageUrl: 'https://example.com/yaris.jpg' },
  documents: [
    { id: 1, documentType: 'IDENTITY', documentUrl: 'https://example.com/doc1.pdf', uploadedAt: '2026-04-01T10:00:00Z' },
    { id: 2, documentType: 'PAYSLIP', documentUrl: 'https://example.com/doc2.pdf', uploadedAt: '2026-04-01T10:00:00Z' },
  ],
}

const mockRentalSubmission: Submission = {
  id: 5,
  type: 'RENTAL',
  status: 'APPROVED',
  profession: 'Médecin',
  monthlyIncome: '5000.00',
  monthlyTotal: '385.00',
  duration: 36,
  annualKm: 15000,
  rejectionReason: null,
  createdAt: '2026-04-15T10:00:00Z',
  vehicle: { '@id': '/api/vehicles/2', id: 2, brand: 'Peugeot', model: '308', year: 2023, imageUrl: null },
  documents: [],
}

const mockRejectedSubmission: Submission = {
  ...mockSaleSubmission,
  status: 'REJECTED',
  rejectionReason: 'Revenus insuffisants pour ce financement.',
  documents: [],
}

function renderPage() {
  return render(<MemoryRouter><SubmissionDetail /></MemoryRouter>)
}

beforeEach(() => {
  mockUseSubmission.mockReturnValue({ data: mockSaleSubmission, isLoading: false, isError: false } as unknown as ReturnType<typeof useSubmissionModule.useSubmission>)
})

describe('SubmissionDetail', () => {

  it('affiche "Chargement..." pendant le chargement', () => {
    mockUseSubmission.mockReturnValue({ data: undefined, isLoading: true, isError: false } as unknown as ReturnType<typeof useSubmissionModule.useSubmission>)
    renderPage()
    expect(screen.getByText(/chargement/i)).toBeInTheDocument()
  })

  it('affiche "Dossier introuvable" en cas d\'erreur', () => {
    mockUseSubmission.mockReturnValue({ data: undefined, isLoading: false, isError: true } as unknown as ReturnType<typeof useSubmissionModule.useSubmission>)
    renderPage()
    expect(screen.getByText(/dossier introuvable/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /retour à mes dossiers/i })).toBeInTheDocument()
  })

  it('affiche le numéro du dossier', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dossier #5')
  })

  it('affiche la section véhicule avec l\'image', () => {
    renderPage()
    expect(screen.getByText('Toyota Yaris')).toBeInTheDocument()
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/yaris.jpg')
    expect(img).toHaveAttribute('alt', 'Toyota Yaris')
  })

  it('affiche les informations du dossier (type, statut, profession, revenus)', () => {
    renderPage()
    expect(screen.getByText('Achat')).toBeInTheDocument()
    expect(screen.getByText('En attente')).toBeInTheDocument()
    expect(screen.getByText('Ingénieur')).toBeInTheDocument()
    expect(screen.getByText('3 500 €')).toBeInTheDocument()
  })

  it('affiche la section location pour un dossier RENTAL', () => {
    mockUseSubmission.mockReturnValue({ data: mockRentalSubmission, isLoading: false, isError: false } as unknown as ReturnType<typeof useSubmissionModule.useSubmission>)
    renderPage()
    expect(screen.getByText('Paramètres de location')).toBeInTheDocument()
    expect(screen.getByText('36 mois')).toBeInTheDocument()
    expect(screen.getByText(/15 000 km\/an/i)).toBeInTheDocument()
    expect(screen.getByText('385 €')).toBeInTheDocument()
  })

  it('n\'affiche pas la section location pour un dossier SALE', () => {
    renderPage()
    expect(screen.queryByText('Paramètres de location')).not.toBeInTheDocument()
  })

  it('affiche la liste des documents avec liens de téléchargement', () => {
    renderPage()
    expect(screen.getByText("Pièce d'identité")).toBeInTheDocument()
    expect(screen.getByText('Bulletin de salaire')).toBeInTheDocument()
    const links = screen.getAllByRole('link', { name: /télécharger/i })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', 'https://example.com/doc1.pdf')
  })

  it('affiche le motif de refus quand le dossier est REJECTED', () => {
    mockUseSubmission.mockReturnValue({ data: mockRejectedSubmission, isLoading: false, isError: false } as unknown as ReturnType<typeof useSubmissionModule.useSubmission>)
    renderPage()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Revenus insuffisants pour ce financement.')).toBeInTheDocument()
  })

  it('n\'affiche pas d\'alerte de refus pour un dossier PENDING', () => {
    renderPage()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('affiche le lien "Retour à Mes dossiers"', () => {
    renderPage()
    const link = screen.getByRole('link', { name: /retour à mes dossiers/i })
    expect(link).toHaveAttribute('href', '/dashboard/submissions')
  })

})
