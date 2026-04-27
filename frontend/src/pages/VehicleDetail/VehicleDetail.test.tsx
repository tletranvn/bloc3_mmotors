import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VehicleDetail from './VehicleDetail';
import * as useVehicleModule from '../../hooks/useVehicle';
import * as useAuthModule from '../../hooks/useAuth';
import type { Vehicle } from '../../services/api/vehicleService';

// useParams retourne toujours id="1" pour les tests
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ id: '1' }) };
});

vi.mock('../../hooks/useVehicle');
vi.mock('../../hooks/useAuth');
const mockUseVehicle = vi.mocked(useVehicleModule.useVehicle);

const baseVehicle: Vehicle = {
  '@id': '/api/vehicles/1',
  '@type': 'Vehicle',
  id: 1,
  brand: 'Renault',
  model: 'Clio',
  year: 2022,
  mileage: 25000,
  fuelType: 'GASOLINE',
  color: 'Rouge',
  salePrice: '14500.00',
  rentalPriceMonthly: null,
  availabilityType: 'SALE',
  status: 'AVAILABLE',
  description: 'Renault Clio 2022 — 25000 km, rouge',
  createdAt: '2024-01-01T00:00:00+00:00',
  imageUrl: 'https://example.com/car.jpg',
};

function mockLoaded(vehicle: Vehicle) {
  mockUseVehicle.mockReturnValue({ data: vehicle, isLoading: false, isError: false } as unknown as ReturnType<typeof useVehicleModule.useVehicle>);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <VehicleDetail />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  })
})

describe('VehicleDetail', () => {
  it('affiche le skeleton loader pendant le chargement', () => {
    mockUseVehicle.mockReturnValue({ data: undefined, isLoading: true, isError: false } as unknown as ReturnType<typeof useVehicleModule.useVehicle>);
    renderPage();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('affiche la page 404 si le véhicule est introuvable', () => {
    mockUseVehicle.mockReturnValue({ data: undefined, isLoading: false, isError: true } as unknown as ReturnType<typeof useVehicleModule.useVehicle>);
    renderPage();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/introuvable/i)).toBeInTheDocument();
  });

  it('affiche la marque, le modèle et l\'année', () => {
    mockLoaded(baseVehicle);
    renderPage();
    const heading = screen.getByRole('heading', { name: /renault clio/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('2022');
  });

  it('affiche la description', () => {
    mockLoaded(baseVehicle);
    renderPage();
    expect(screen.getByText(/renault clio 2022/i)).toBeInTheDocument();
  });

  it('affiche l\'image du véhicule', () => {
    mockLoaded(baseVehicle);
    renderPage();
    expect(screen.getByAltText(/renault clio/i)).toHaveAttribute('src', 'https://example.com/car.jpg');
  });

  it('affiche une image de remplacement si imageUrl est null', () => {
    mockLoaded({ ...baseVehicle, imageUrl: null });
    renderPage();
    expect(screen.getByAltText(/renault clio/i)).toHaveAttribute('src', expect.stringContaining('placehold.co'));
  });

  it('affiche le badge de statut "Disponible"', () => {
    mockLoaded(baseVehicle);
    renderPage();
    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  it('affiche le badge de disponibilité "Vente"', () => {
    mockLoaded(baseVehicle);
    renderPage();
    expect(screen.getByText('Vente')).toBeInTheDocument();
  });

  it('affiche le prix de vente avec son libellé', () => {
    mockLoaded(baseVehicle);
    renderPage();
    expect(screen.getByText(/prix de vente/i)).toBeInTheDocument();
    expect(screen.getByText(/14\s*500/)).toBeInTheDocument();
  });

  it('affiche le tarif de location avec son libellé', () => {
    mockLoaded({ ...baseVehicle, availabilityType: 'RENTAL', salePrice: null, rentalPriceMonthly: '299.00' });
    renderPage();
    expect(screen.getByText(/tarif de location/i)).toBeInTheDocument();
    expect(screen.getByText(/299/)).toBeInTheDocument();
  });

  it('affiche les deux prix si availabilityType est BOTH', () => {
    mockLoaded({ ...baseVehicle, availabilityType: 'BOTH', rentalPriceMonthly: '350.00' });
    renderPage();
    expect(screen.getByText(/prix de vente/i)).toBeInTheDocument();
    expect(screen.getByText(/tarif de location/i)).toBeInTheDocument();
  });

  it('affiche les services inclus si le véhicule est en location', () => {
    mockLoaded({ ...baseVehicle, availabilityType: 'RENTAL', salePrice: null, rentalPriceMonthly: '299.00' });
    renderPage();
    expect(screen.getByText(/services inclus/i)).toBeInTheDocument();
    expect(screen.getByText(/assurance/i)).toBeInTheDocument();
  });

  it('n\'affiche pas les services inclus si le véhicule est en vente seule', () => {
    mockLoaded(baseVehicle);
    renderPage();
    expect(screen.queryByText(/services inclus/i)).not.toBeInTheDocument();
  });

  it('affiche le breadcrumb avec la marque et le modèle', () => {
    mockLoaded(baseVehicle);
    renderPage();
    const breadcrumb = screen.getByRole('navigation', { name: /fil d'ariane/i });
    expect(within(breadcrumb).getByText('Renault Clio')).toBeInTheDocument();
  });

  it('affiche le lien retour vers le catalogue', () => {
    mockLoaded(baseVehicle);
    renderPage();
    expect(screen.getByRole('link', { name: /retour au catalogue/i })).toBeInTheDocument();
  });

  it('affiche le CTA "Créer un compte" si non connecté', () => {
    mockLoaded(baseVehicle);
    renderPage();
    expect(screen.getByRole('link', { name: /créer un compte/i })).toBeInTheDocument();
  });

  it('affiche le CTA "Déposer ma demande" si connecté', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, email: 'jean@email.com', firstName: 'Jean', lastName: 'Dupont', phone: '0612345678', roles: ['ROLE_USER'] },
      token: 'fake-token',
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    })
    mockLoaded(baseVehicle);
    renderPage();
    const link = screen.getByRole('link', { name: /déposer ma demande/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/submissions/new?vehicle=1')
  });
});
