import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SubmissionPage from './SubmissionPage'
import * as useVehicleModule from '../../hooks/useVehicle'
import * as useAuthModule from '../../hooks/useAuth'
import type { Vehicle } from '../../services/api/vehicleService'

vi.mock('../../hooks/useVehicle')
vi.mock('../../hooks/useAuth')
vi.mock('../../components/features/submissions/SubmissionForm/SubmissionForm', () => ({
  default: () => <div data-testid="submission-form" />,
}))

const mockUser = {
  id: 1, email: 'jean@email.com', firstName: 'Jean', lastName: 'Dupont',
  phone: '0612345678', roles: ['ROLE_USER'],
}

const mockVehicle: Vehicle = {
  '@id': '/api/vehicles/1', '@type': 'Vehicle',
  id: 1, brand: 'Toyota', model: 'Yaris', year: 2022,
  mileage: 10000, fuelType: 'GASOLINE', color: null,
  salePrice: '15000', rentalPriceMonthly: null,
  availabilityType: 'SALE', status: 'AVAILABLE',
  description: null, createdAt: '2026-01-01T00:00:00Z', imageUrl: null,
}

beforeEach(() => {
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    isAuthenticated: true, isLoading: false, user: mockUser, token: 'fake-token',
    login: vi.fn(), logout: vi.fn(), updateUser: vi.fn(),
  })
})

function renderPage(search = '?vehicle=1&type=SALE') {
  return render(
    <MemoryRouter initialEntries={[`/submissions/new${search}`]}>
      <Routes>
        <Route path="/submissions/new" element={<SubmissionPage />} />
        <Route path="/vehicles" element={<div>catalogue</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('SubmissionPage', () => {

  it('affiche "Aucun véhicule sélectionné" si le paramètre vehicle est absent', () => {
    vi.spyOn(useVehicleModule, 'useVehicle').mockReturnValue(
      { data: undefined, isLoading: false, isError: false } as ReturnType<typeof useVehicleModule.useVehicle>
    )
    renderPage('')
    expect(screen.getByText(/aucun véhicule sélectionné/i)).toBeInTheDocument()
  })

  it('affiche un état de chargement', () => {
    vi.spyOn(useVehicleModule, 'useVehicle').mockReturnValue(
      { data: undefined, isLoading: true, isError: false } as ReturnType<typeof useVehicleModule.useVehicle>
    )
    renderPage()
    expect(screen.getByText(/chargement/i)).toBeInTheDocument()
  })

  it('affiche "Véhicule introuvable" en cas d\'erreur', () => {
    vi.spyOn(useVehicleModule, 'useVehicle').mockReturnValue(
      { data: undefined, isLoading: false, isError: true } as ReturnType<typeof useVehicleModule.useVehicle>
    )
    renderPage()
    expect(screen.getByText(/véhicule introuvable/i)).toBeInTheDocument()
  })

  it('affiche le nom du véhicule et le formulaire quand tout est chargé', () => {
    vi.spyOn(useVehicleModule, 'useVehicle').mockReturnValue(
      { data: mockVehicle, isLoading: false, isError: false } as ReturnType<typeof useVehicleModule.useVehicle>
    )
    renderPage()
    expect(screen.getByText('Toyota Yaris')).toBeInTheDocument()
    expect(screen.getByTestId('submission-form')).toBeInTheDocument()
  })

})
