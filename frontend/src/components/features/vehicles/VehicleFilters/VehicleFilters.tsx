import { FUEL_TYPE_LABELS } from '../../../../constants/labels';

const BRANDS = ['Audi', 'BMW', 'Citroën', 'Mercedes', 'Peugeot', 'Renault', 'Tesla', 'Toyota', 'Volkswagen'];

const SALE_MAX_PRICE = 50000;
const RENTAL_MAX_PRICE = 1500;

export type VehicleFiltersState = {
  availabilityType: string;
  brand: string;
  fuelType: string;
  maxPrice: number;
};

export const DEFAULT_FILTERS: VehicleFiltersState = {
  availabilityType: '',
  brand: '',
  fuelType: '',
  maxPrice: 0,
};

interface VehicleFiltersProps {
  readonly filters: VehicleFiltersState;
  readonly onChange: (filters: VehicleFiltersState) => void;
}

const MODE_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'SALE', label: "Achat" },
  { value: 'RENTAL', label: 'Location (LLD)' },
];

export function VehicleFilters({ filters, onChange }: VehicleFiltersProps) {
  const isRentalMode = filters.availabilityType === 'RENTAL';
  const maxPrice = isRentalMode ? RENTAL_MAX_PRICE : SALE_MAX_PRICE;
  const priceStep = isRentalMode ? 50 : 1000;
  const priceUnit = isRentalMode ? '€/mois' : '€';

  function handleChange(field: keyof VehicleFiltersState, value: string | number) {
    const updated = { ...filters, [field]: value };
    if (field === 'availabilityType') {
      updated.maxPrice = 0;
    }
    onChange(updated);
  }

  return (
    <aside aria-label="Filtres véhicules" className="flex flex-col gap-6">

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-foreground mb-1">Mode</legend>
        {MODE_OPTIONS.map(({ value, label }) => (
          <label key={value} className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
            <input
              type="radio"
              name="availabilityType"
              value={value}
              checked={filters.availabilityType === value}
              onChange={() => handleChange('availabilityType', value)}
              className="accent-foreground"
            />
            {label}
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor="brand-select" className="text-sm font-semibold text-foreground">
          Marque
        </label>
        <select
          id="brand-select"
          value={filters.brand}
          onChange={(e) => handleChange('brand', e.target.value)}
          className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          <option value="">Toutes les marques</option>
          {BRANDS.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="budget-slider" className="text-sm font-semibold text-foreground">
          Budget max
          <span className="ml-2 font-normal text-muted">
            {filters.maxPrice > 0
              ? `${filters.maxPrice.toLocaleString('fr-FR')} ${priceUnit}`
              : 'Sans limite'}
          </span>
        </label>
        <input
          id="budget-slider"
          type="range"
          min={0}
          max={maxPrice}
          step={priceStep}
          value={filters.maxPrice}
          onChange={(e) => handleChange('maxPrice', Number(e.target.value))}
          className="w-full accent-foreground"
        />
        <div className="flex justify-between text-xs text-muted">
          <span>0 {priceUnit}</span>
          <span>{maxPrice.toLocaleString('fr-FR')} {priceUnit}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fuel-select" className="text-sm font-semibold text-foreground">
          Motorisation
        </label>
        <select
          id="fuel-select"
          value={filters.fuelType}
          onChange={(e) => handleChange('fuelType', e.target.value)}
          className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          <option value="">Toutes</option>
          {Object.entries(FUEL_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => onChange(DEFAULT_FILTERS)}
        className="text-sm text-muted underline underline-offset-2 hover:text-foreground transition-colors text-left"
      >
        Réinitialiser les filtres
      </button>

    </aside>
  );
}
