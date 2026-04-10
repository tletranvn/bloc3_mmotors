import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VehicleList } from './VehicleList';
import * as useVehiclesModule from '../../hooks/useVehicles';

vi.mock('../../hooks/useVehicles');
const mockUseVehicles = vi.mocked(useVehiclesModule.useVehicles);

const fakeData = {
  member: [
    {
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
      description: null,
      createdAt: '2024-01-01T00:00:00+00:00',
      imageUrl: null,
    },
  ],
  totalItems: 1,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <VehicleList />
    </MemoryRouter>
  );
}

beforeEach(() => vi.clearAllMocks());

describe('VehicleList', () => {
  it('affiche le message de chargement', () => {
    mockUseVehicles.mockReturnValue({ isLoading: true, isError: false, data: undefined } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>);
    renderPage();
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it('affiche la liste des véhicules après chargement', () => {
    mockUseVehicles.mockReturnValue({ isLoading: false, isError: false, data: fakeData } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>);
    renderPage();
    expect(screen.getByText(/renault clio/i)).toBeInTheDocument();
  });

  it('affiche un message si aucun véhicule disponible', () => {
    mockUseVehicles.mockReturnValue({ isLoading: false, isError: false, data: { member: [], totalItems: 0 } } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>);
    renderPage();
    expect(screen.getByText(/aucun véhicule/i)).toBeInTheDocument();
  });

  it("affiche un message d'erreur si l'API échoue", () => {
    mockUseVehicles.mockReturnValue({ isLoading: false, isError: true, data: undefined } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>);
    renderPage();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('affiche le compteur de véhicules trouvés', () => {
    mockUseVehicles.mockReturnValue({ isLoading: false, isError: false, data: fakeData } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>);
    renderPage();
    expect(screen.getByText('1 véhicule trouvé')).toBeInTheDocument();
  });

  it('affiche le bouton Filtres sur mobile', () => {
    mockUseVehicles.mockReturnValue({ isLoading: false, isError: false, data: fakeData } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>);
    renderPage();
    expect(screen.getByRole('button', { name: 'Filtres' })).toBeInTheDocument();
  });

  it('ouvre le drawer mobile au clic sur Filtres', () => {
    mockUseVehicles.mockReturnValue({ isLoading: false, isError: false, data: fakeData } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Filtres' }));
    expect(screen.getByRole('button', { name: 'Fermer les filtres' })).toBeInTheDocument();
  });

  it('ferme le drawer mobile au clic sur Fermer', () => {
    mockUseVehicles.mockReturnValue({ isLoading: false, isError: false, data: fakeData } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Filtres' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fermer les filtres' }));
    expect(screen.queryByRole('button', { name: 'Fermer les filtres' })).not.toBeInTheDocument();
  });

  it('ferme le drawer mobile au clic sur "Voir les résultats"', () => {
    mockUseVehicles.mockReturnValue({ isLoading: false, isError: false, data: fakeData } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Filtres' }));
    fireEvent.click(screen.getByRole('button', { name: /Voir les résultats/i }));
    expect(screen.queryByRole('button', { name: 'Fermer les filtres' })).not.toBeInTheDocument();
  });

  it('met à jour la valeur du filtre marque quand on la change', () => {
    mockUseVehicles.mockReturnValue({ isLoading: false, isError: false, data: fakeData } as unknown as ReturnType<typeof useVehiclesModule.useVehicles>);
    renderPage();
    const brandSelect = screen.getByRole('combobox', { name: 'Marque' });
    fireEvent.change(brandSelect, { target: { value: 'Renault' } });
    expect(brandSelect).toHaveValue('Renault');
  });
});
