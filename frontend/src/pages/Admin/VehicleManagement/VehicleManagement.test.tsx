import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import VehicleManagement from './VehicleManagement'
import * as useVehiclesModule from '../../../hooks/useVehicles'
import * as vehicleService from '../../../services/api/vehicleService'
import type { Vehicle } from '../../../services/api/vehicleService'

vi.mock('../../../hooks/useVehicles')
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ token: 'fake-token', isAuthenticated: true }),
}))
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) }
})
vi.mock('../../../services/api/vehicleService', async (importOriginal) => {
  const actual = await importOriginal<typeof vehicleService>()
  return {
    ...actual,
    deleteVehicle: vi.fn(),
    toggleVehicleAvailability: vi.fn(),
    updateVehicle: vi.fn(),
  }
})
vi.mock('../../../components/features/admin/VehicleForm/VehicleForm', () => ({
  default: ({ vehicle, onCancel, onSuccess }: { vehicle?: Vehicle; onCancel: () => void; onSuccess: () => void }) => (
    <div data-testid="vehicle-form">
      <span>{vehicle ? `Modifier ${vehicle.brand}` : 'Ajouter un véhicule'}</span>
      <button onClick={onCancel}>Fermer form</button>
      <button onClick={onSuccess}>Soumettre form</button>
    </div>
  ),
}))

const mockUseVehicles = vi.mocked(useVehiclesModule.useVehicles)

// Véhicule SALE sans loyer (toggle → modal prix)
const mockVehicle: Vehicle = {
  '@id': '/api/vehicles/1',
  '@type': 'Vehicle',
  id: 1,
  brand: 'Renault',
  model: 'Clio',
  year: 2022,
  mileage: 15000,
  fuelType: 'GASOLINE',
  color: 'Blanc',
  salePrice: '12000.00',
  rentalPriceMonthly: null,
  availabilityType: 'SALE',
  status: 'AVAILABLE',
  description: null,
  createdAt: '2026-01-01T00:00:00Z',
  imageUrl: null,
  activeSubmissionsCount: 0,
}

const mockVehicle2: Vehicle = {
  ...mockVehicle,
  '@id': '/api/vehicles/2',
  id: 2,
  brand: 'Peugeot',
  model: '308',
}

// Véhicule SALE avec les deux prix → toggle direct (sans modal)
const mockVehicleWithBothPrices: Vehicle = {
  ...mockVehicle,
  id: 3,
  brand: 'Toyota',
  model: 'Yaris',
  rentalPriceMonthly: '450.00',
  activeSubmissionsCount: 0,
}

// Véhicule avec dossiers actifs → boutons désactivés
const mockVehicleActive: Vehicle = {
  ...mockVehicle,
  id: 4,
  brand: 'Tesla',
  model: 'Model 3',
  activeSubmissionsCount: 2,
}

function renderPage() {
  return render(<MemoryRouter><VehicleManagement /></MemoryRouter>)
}

function mockToggleSuccess() {
  vi.mocked(vehicleService.toggleVehicleAvailability).mockResolvedValue({
    ...mockVehicleWithBothPrices,
    availabilityType: 'RENTAL',
  })
}

function mockToggle409() {
  vi.mocked(vehicleService.toggleVehicleAvailability).mockRejectedValue({
    response: { status: 409, data: { detail: 'Impossible : un dossier est en cours.' } },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseVehicles.mockReturnValue({
    data: { member: [mockVehicle, mockVehicle2], totalItems: 2 },
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>)
  vi.mocked(vehicleService.deleteVehicle).mockResolvedValue()
  vi.mocked(vehicleService.updateVehicle).mockResolvedValue(mockVehicle)
  mockToggleSuccess()
})

describe('VehicleManagement', () => {

  it('affiche le titre "Gestion des véhicules"', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gestion des véhicules')
  })

  it('affiche les véhicules dans le tableau', () => {
    renderPage()
    expect(screen.getByText('Renault Clio')).toBeInTheDocument()
    expect(screen.getByText('Peugeot 308')).toBeInTheDocument()
  })

  it('affiche les boutons "Modifier", "Basculer" et "Supprimer" pour chaque véhicule', () => {
    renderPage()
    expect(screen.getAllByRole('button', { name: /modifier/i })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: /basculer/i })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: /supprimer/i })).toHaveLength(2)
  })

  it('affiche "Chargement..." pendant le chargement', () => {
    mockUseVehicles.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>)
    renderPage()
    expect(screen.getByText(/chargement/i)).toBeInTheDocument()
  })

  it('affiche un message d\'erreur en cas d\'échec', () => {
    mockUseVehicles.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>)
    renderPage()
    expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument()
  })

  it('affiche le formulaire de création après clic sur "Ajouter"', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /ajouter un véhicule/i }))
    expect(screen.getByTestId('vehicle-form')).toBeInTheDocument()
    expect(screen.getByText('Ajouter un véhicule')).toBeInTheDocument()
  })

  it('affiche le formulaire d\'édition pré-rempli après clic sur "Modifier"', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: /modifier/i })[0])
    expect(screen.getByTestId('vehicle-form')).toBeInTheDocument()
    expect(screen.getByText('Modifier Renault')).toBeInTheDocument()
  })

  it('ferme le formulaire après clic sur Annuler', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /ajouter un véhicule/i }))
    fireEvent.click(screen.getByRole('button', { name: /fermer form/i }))
    expect(screen.queryByTestId('vehicle-form')).not.toBeInTheDocument()
  })

  it('ferme le formulaire après soumission réussie', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /ajouter un véhicule/i }))
    fireEvent.click(screen.getByRole('button', { name: /soumettre form/i }))
    expect(screen.queryByTestId('vehicle-form')).not.toBeInTheDocument()
  })

  it('ouvre la modale de confirmation après clic sur "Supprimer"', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: /supprimer/i })[0])
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText(/renault clio/i)).toBeInTheDocument()
  })

  it('ferme la modale de confirmation après clic sur Annuler', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: /supprimer/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /^annuler$/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('affiche "Aucun véhicule" quand la liste est vide', () => {
    mockUseVehicles.mockReturnValue({
      data: { member: [], totalItems: 0 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>)
    renderPage()
    expect(screen.getByText(/aucun véhicule/i)).toBeInTheDocument()
  })

  it('appelle deleteVehicle et ferme la modale après confirmation', async () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: /supprimer/i })[0])
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^supprimer$/i }))
    await waitFor(() => {
      expect(vehicleService.deleteVehicle).toHaveBeenCalledWith('fake-token', 1)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('affiche le message d\'erreur 409 si le véhicule a des dossiers actifs (suppression)', async () => {
    vi.mocked(vehicleService.deleteVehicle).mockRejectedValue({ response: { status: 409 } })
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: /supprimer/i })[0])
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^supprimer$/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/dossiers actifs/i)).toBeInTheDocument()
    })
  })

  it('affiche un message d\'erreur générique si la suppression échoue (non-409)', async () => {
    vi.mocked(vehicleService.deleteVehicle).mockRejectedValue({ response: { status: 500 } })
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: /supprimer/i })[0])
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^supprimer$/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument()
    })
  })

  it('affiche la pagination quand il y a plus de 12 véhicules', () => {
    mockUseVehicles.mockReturnValue({
      data: { member: [mockVehicle, mockVehicle2], totalItems: 25 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>)
    renderPage()
    expect(screen.getByText(/page 1 \/ 3/i)).toBeInTheDocument()
  })

  it('avance à la page suivante via le bouton →', () => {
    mockUseVehicles.mockReturnValue({
      data: { member: [mockVehicle, mockVehicle2], totalItems: 25 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: '→' }))
    expect(screen.getByText(/page 2 \/ 3/i)).toBeInTheDocument()
  })

  it('revient à la page précédente via le bouton ←', () => {
    mockUseVehicles.mockReturnValue({
      data: { member: [mockVehicle, mockVehicle2], totalItems: 25 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: '→' }))
    fireEvent.click(screen.getByRole('button', { name: '←' }))
    expect(screen.getByText(/page 1 \/ 3/i)).toBeInTheDocument()
  })

  // ─── Boutons désactivés (dossiers actifs) ──────────────────────────────────

  describe('Boutons désactivés quand activeSubmissionsCount > 0', () => {
    beforeEach(() => {
      mockUseVehicles.mockReturnValue({
        data: { member: [mockVehicleActive], totalItems: 1 },
        isLoading: false,
        isError: false,
      } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>)
    })

    it('désactive le bouton "Modifier"', () => {
      renderPage()
      expect(screen.getByRole('button', { name: /modifier/i })).toBeDisabled()
    })

    it('désactive le bouton "Basculer"', () => {
      renderPage()
      expect(screen.getByRole('button', { name: /basculer/i })).toBeDisabled()
    })

    it('désactive le bouton "Supprimer"', () => {
      renderPage()
      expect(screen.getByRole('button', { name: /supprimer/i })).toBeDisabled()
    })

    it('affiche le badge orange avec le compteur de dossiers', () => {
      renderPage()
      expect(screen.getByText(/2 actifs/i)).toBeInTheDocument()
    })
  })

  // ─── Toggle direct (deux prix présents) ───────────────────────────────────

  describe('Toggle direct (sans modal prix)', () => {
    beforeEach(() => {
      mockUseVehicles.mockReturnValue({
        data: { member: [mockVehicleWithBothPrices], totalItems: 1 },
        isLoading: false,
        isError: false,
      } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>)
    })

    it('appelle toggleVehicleAvailability avec le bon token et id', async () => {
      renderPage()
      fireEvent.click(screen.getByRole('button', { name: /basculer/i }))
      await waitFor(() => {
        expect(vehicleService.toggleVehicleAvailability).toHaveBeenCalledWith('fake-token', 3)
      })
    })

    it('affiche le toast de succès après bascule', async () => {
      renderPage()
      fireEvent.click(screen.getByRole('button', { name: /basculer/i }))
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
    })

    it('affiche l\'erreur 409 avec le message du serveur', async () => {
      mockToggle409()
      renderPage()
      fireEvent.click(screen.getByRole('button', { name: /basculer/i }))
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Impossible : un dossier est en cours.')
      })
    })

    it('affiche une erreur générique si toggle échoue (non-409)', async () => {
      vi.mocked(vehicleService.toggleVehicleAvailability).mockRejectedValue({
        response: { status: 500 },
      })
      renderPage()
      fireEvent.click(screen.getByRole('button', { name: /basculer/i }))
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })

  // ─── Modal prix manquant ───────────────────────────────────────────────────

  describe('Modal saisie prix manquant', () => {
    it('ouvre la modal si rentalPriceMonthly absent (SALE)', () => {
      renderPage()
      fireEvent.click(screen.getAllByRole('button', { name: /basculer/i })[0])
      expect(screen.getByText(/prix requis pour basculer/i)).toBeInTheDocument()
    })

    it('ferme la modal après clic sur Annuler sans appeler l\'API', () => {
      renderPage()
      fireEvent.click(screen.getAllByRole('button', { name: /basculer/i })[0])
      fireEvent.click(screen.getByRole('button', { name: /annuler/i }))
      expect(screen.queryByText(/prix requis pour basculer/i)).not.toBeInTheDocument()
      expect(vehicleService.updateVehicle).not.toHaveBeenCalled()
    })

    it('le bouton "Confirmer" est désactivé si le champ prix est vide', () => {
      renderPage()
      fireEvent.click(screen.getAllByRole('button', { name: /basculer/i })[0])
      expect(screen.getByRole('button', { name: /confirmer et basculer/i })).toBeDisabled()
    })

    it('appelle updateVehicle puis toggleVehicleAvailability après confirmation', async () => {
      renderPage()
      fireEvent.click(screen.getAllByRole('button', { name: /basculer/i })[0])
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '450' } })
      fireEvent.click(screen.getByRole('button', { name: /confirmer et basculer/i }))
      await waitFor(() => {
        expect(vehicleService.updateVehicle).toHaveBeenCalledTimes(1)
        expect(vehicleService.toggleVehicleAvailability).toHaveBeenCalledWith('fake-token', 1)
      })
    })

    it('ferme la modal après confirmation réussie', async () => {
      renderPage()
      fireEvent.click(screen.getAllByRole('button', { name: /basculer/i })[0])
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '450' } })
      fireEvent.click(screen.getByRole('button', { name: /confirmer et basculer/i }))
      await waitFor(() => {
        expect(screen.queryByText(/prix requis pour basculer/i)).not.toBeInTheDocument()
      })
    })

    it('rollback : appelle updateVehicle deux fois si le toggle échoue (409)', async () => {
      mockToggle409()
      renderPage()
      fireEvent.click(screen.getAllByRole('button', { name: /basculer/i })[0])
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '450' } })
      fireEvent.click(screen.getByRole('button', { name: /confirmer et basculer/i }))
      await waitFor(() => {
        expect(vehicleService.updateVehicle).toHaveBeenCalledTimes(2)
      })
    })

    it('affiche l\'erreur après rollback', async () => {
      mockToggle409()
      renderPage()
      fireEvent.click(screen.getAllByRole('button', { name: /basculer/i })[0])
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '450' } })
      fireEvent.click(screen.getByRole('button', { name: /confirmer et basculer/i }))
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })

})
