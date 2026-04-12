import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VehicleFilters } from './VehicleFilters';
import { DEFAULT_FILTERS } from './vehicleFiltersTypes';

const BRAND = 'Renault';

const defaultProps = {
  filters: DEFAULT_FILTERS,
  onChange: vi.fn(),
};

describe('VehicleFilters', () => {
  it('affiche les 3 options de mode', () => {
    render(<VehicleFilters {...defaultProps} />);
    expect(screen.getByRole('radio', { name: 'Tous' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: "Achat" })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Location (LLD)' })).toBeInTheDocument();
  });

  it('coche "Tous" par défaut', () => {
    render(<VehicleFilters {...defaultProps} />);
    expect(screen.getByRole('radio', { name: 'Tous' })).toBeChecked();
  });

  it('affiche le select marque avec les options', () => {
    render(<VehicleFilters {...defaultProps} />);
    const select = screen.getByRole('combobox', { name: 'Marque' });
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Toutes les marques' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: BRAND })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'BMW' })).toBeInTheDocument();
  });

  it('affiche le slider budget avec échelle achat (50 000€) par défaut', () => {
    render(<VehicleFilters {...defaultProps} />);
    const slider = screen.getByRole('slider', { name: /Budget max/i });
    expect(slider).toHaveAttribute('max', '50000');
    expect(screen.getByText('50 000 €')).toBeInTheDocument();
  });

  it('adapte le slider budget à l\'échelle location (1 500€/mois) en mode RENTAL', () => {
    render(
      <VehicleFilters
        filters={{ ...DEFAULT_FILTERS, availabilityType: 'RENTAL' }}
        onChange={vi.fn()}
      />
    );
    const slider = screen.getByRole('slider', { name: /Budget max/i });
    expect(slider).toHaveAttribute('max', '1500');
    expect(screen.getByText('1 500 €/mois')).toBeInTheDocument();
  });

  it('affiche le select motorisation avec les 4 options', () => {
    render(<VehicleFilters {...defaultProps} />);
    expect(screen.getByRole('combobox', { name: 'Motorisation' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Essence' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Diesel' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Hybride' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Électrique' })).toBeInTheDocument();
  });

  it('appelle onChange quand on change le mode', () => {
    const onChange = vi.fn();
    render(<VehicleFilters filters={DEFAULT_FILTERS} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: "Achat" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ availabilityType: 'SALE' })
    );
  });

  it('appelle onChange quand on change la marque', () => {
    const onChange = vi.fn();
    render(<VehicleFilters filters={DEFAULT_FILTERS} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Marque' }), {
      target: { value: BRAND },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ brand: BRAND })
    );
  });

  it('appelle onChange quand on change la motorisation', () => {
    const onChange = vi.fn();
    render(<VehicleFilters filters={DEFAULT_FILTERS} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Motorisation' }), {
      target: { value: 'DIESEL' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ fuelType: 'DIESEL' })
    );
  });

  it('remet maxPrice à 0 quand on change de mode', () => {
    const onChange = vi.fn();
    render(
      <VehicleFilters
        filters={{ ...DEFAULT_FILTERS, maxPrice: 20000 }}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Location (LLD)' }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ availabilityType: 'RENTAL', maxPrice: 0 })
    );
  });

  it('affiche le bouton Réinitialiser et remet tous les filtres à zéro', () => {
    const onChange = vi.fn();
    render(
      <VehicleFilters
        filters={{ availabilityType: 'SALE', brand: BRAND, fuelType: 'DIESEL', maxPrice: 20000 }}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Réinitialiser/i }));
    expect(onChange).toHaveBeenCalledWith({
      availabilityType: '',
      brand: '',
      fuelType: '',
      maxPrice: 0,
    });
  });
});
