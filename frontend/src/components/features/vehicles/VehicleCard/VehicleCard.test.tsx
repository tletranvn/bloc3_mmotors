import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { VehicleCard } from './VehicleCard';
import type { Vehicle } from '../../../../services/api/vehicleService';

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
  description: null,
  createdAt: '2024-01-01T00:00:00+00:00',
  imageUrl: 'https://example.com/car.jpg',
};

function renderCard(vehicle: Vehicle) {
  return render(
    <MemoryRouter>
      <VehicleCard vehicle={vehicle} />
    </MemoryRouter>
  );
}

describe('VehicleCard', () => {
  it('affiche la marque et le modèle', () => {
    renderCard(baseVehicle);
    expect(screen.getByRole('heading', { name: /renault clio/i })).toBeInTheDocument();
  });

  it('affiche le carburant traduit en français', () => {
    renderCard(baseVehicle);
    expect(screen.getByText('Essence')).toBeInTheDocument();
  });

  it('affiche le prix de vente formaté', () => {
    renderCard(baseVehicle);
    expect(screen.getByText(/14\s*500/)).toBeInTheDocument();
  });

  it("affiche l'image avec un alt contenant la marque", () => {
    renderCard(baseVehicle);
    expect(screen.getByAltText(/renault/i)).toBeInTheDocument();
  });

  it('affiche le lien "Voir détails"', () => {
    renderCard(baseVehicle);
    expect(screen.getByRole('link', { name: /voir détails/i })).toBeInTheDocument();
  });

  it('le lien "Voir détails" pointe vers /vehicles/1', () => {
    renderCard(baseVehicle);
    expect(screen.getByRole('link', { name: /voir détails/i })).toHaveAttribute('href', '/vehicles/1');
  });

  it("affiche une image de remplacement si imageUrl est null", () => {
    renderCard({ ...baseVehicle, imageUrl: null });
    expect(screen.getByAltText(/renault/i)).toHaveAttribute('src', expect.stringContaining('placehold.co'));
  });

  it('affiche le badge SALE en bleu', () => {
    renderCard(baseVehicle);
    const badge = screen.getByText('Vente');
    expect(badge.className).toContain('bg-blue-100');
  });

  it('affiche le badge RENTAL en vert', () => {
    renderCard({ ...baseVehicle, availabilityType: 'RENTAL', salePrice: null, rentalPriceMonthly: '299.00' });
    const badge = screen.getByText('Location');
    expect(badge.className).toContain('bg-green-100');
  });

  it('affiche le badge BOTH en violet', () => {
    renderCard({ ...baseVehicle, availabilityType: 'BOTH', rentalPriceMonthly: '350.00' });
    const badge = screen.getByText('Vente & Location');
    expect(badge.className).toContain('bg-purple-100');
  });

  it('affiche "—" si aucun prix disponible', () => {
    renderCard({ ...baseVehicle, salePrice: null, rentalPriceMonthly: null });
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('affiche le prix mensuel si pas de prix de vente', () => {
    renderCard({ ...baseVehicle, salePrice: null, rentalPriceMonthly: '299.00' });
    expect(screen.getByText(/299/)).toBeInTheDocument();
  });
});
