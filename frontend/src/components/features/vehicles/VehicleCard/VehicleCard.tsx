import { Link } from 'react-router-dom';
import type { Vehicle } from '../../../../services/api/vehicleService';
import {
  FUEL_TYPE_LABELS,
  AVAILABILITY_TYPE_LABELS,
  AVAILABILITY_TYPE_BADGE_CLASSES,
} from '../../../../constants/labels';

function formatPrice(price: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(parseFloat(price));
}

interface Props {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: Props) {
  const { id, brand, model, year, fuelType, salePrice, rentalPriceMonthly, availabilityType, imageUrl } = vehicle;

  return (
    <article className="bg-surface rounded overflow-hidden flex flex-col border border-black/8 hover-card">
      <img
        src={imageUrl ?? 'https://placehold.co/600x400?text=Aucune+image'}
        alt={`${brand} ${model}`}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold text-foreground text-base">
            {brand} {model} <span className="text-muted font-normal">{year}</span>
          </h2>
          <span
            className={`text-xs px-2 py-1 rounded shrink-0 ${AVAILABILITY_TYPE_BADGE_CLASSES[availabilityType] ?? 'bg-background text-muted'}`}
          >
            {AVAILABILITY_TYPE_LABELS[availabilityType] ?? availabilityType}
          </span>
        </div>

        <p className="text-muted text-sm">{FUEL_TYPE_LABELS[fuelType] ?? fuelType}</p>

        <p className="text-foreground font-semibold text-lg mt-auto">
          {salePrice
            ? formatPrice(salePrice)
            : rentalPriceMonthly
              ? `${formatPrice(rentalPriceMonthly)} / mois`
              : '—'}
        </p>

        <Link
          to={`/vehicles/${id}`}
          className="hover-btn bg-primary text-white text-center text-sm font-semibold px-4 py-2 rounded"
        >
          Voir détails
        </Link>
      </div>
    </article>
  );
}
