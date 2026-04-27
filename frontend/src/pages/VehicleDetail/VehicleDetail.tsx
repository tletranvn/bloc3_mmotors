import { Link, useParams } from 'react-router-dom';
import { useVehicle } from '../../hooks/useVehicle';
import { useAuth } from '../../hooks/useAuth';
import VehicleSpecs from '../../components/vehicles/VehicleSpecs';
import ServicesList from '../../components/vehicles/ServicesList';
import { VEHICLE_STATUS_LABELS, AVAILABILITY_TYPE_LABELS, AVAILABILITY_TYPE_BADGE_CLASSES, SALE_GUARANTEES } from '../../constants/labels';

function formatPrice(price: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Number.parseFloat(price));
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  RESERVED: 'bg-yellow-100 text-yellow-800',
  SOLD: 'bg-red-100 text-red-800',
  ON_LEASE: 'bg-blue-100 text-blue-800',
  MAINTENANCE: 'bg-gray-100 text-gray-800',
};

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: vehicle, isLoading, isError } = useVehicle(Number(id));

  const { isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div aria-busy="true" className="py-8 px-4 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-72 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <div role="alert" className="py-8 px-4 max-w-4xl mx-auto text-center">
        <p className="text-2xl font-bold text-foreground mb-2">Véhicule introuvable</p>
        <p className="text-muted mb-6">Ce véhicule n'existe pas ou a été retiré.</p>
        <Link
          to="/vehicles"
          className="hover-btn bg-primary text-white px-4 py-2 rounded text-sm font-semibold"
        >
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const { brand, model, year, status, availabilityType, salePrice, rentalPriceMonthly, imageUrl, description } = vehicle;

  return (
    <main className="py-8 px-4 max-w-4xl mx-auto">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted mb-6 flex items-center gap-1">
        <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
        <span>/</span>
        <Link to="/vehicles" className="hover:text-foreground transition-colors">Véhicules</Link>
        <span>/</span>
        <span className="text-foreground">{brand} {model}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img
          src={imageUrl ?? 'https://placehold.co/600x400?text=Aucune+image'}
          alt={`${brand} ${model}`}
          className="w-full rounded object-cover"
        />

        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-display text-2xl font-extrabold text-foreground">
              {brand} {model}{' '}
              <span className="text-muted font-normal text-xl">{year}</span>
            </h1>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span
                className={`text-xs px-2 py-1 rounded ${AVAILABILITY_TYPE_BADGE_CLASSES[availabilityType] ?? 'bg-gray-100 text-gray-800'}`}
              >
                {AVAILABILITY_TYPE_LABELS[availabilityType] ?? availabilityType}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded ${STATUS_BADGE_CLASSES[status] ?? 'bg-gray-100 text-gray-800'}`}
              >
                {VEHICLE_STATUS_LABELS[status] ?? status}
              </span>
            </div>
          </div>

          {description && <p className="text-muted text-sm">{description}</p>}

          <VehicleSpecs vehicle={vehicle} />

          <div className="border-t pt-4 space-y-3">
            {availabilityType !== 'RENTAL' && salePrice && (
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-0.5">Prix de vente</p>
                <p className="text-foreground font-semibold text-xl">{formatPrice(salePrice)}</p>
              </div>
            )}
            {availabilityType !== 'SALE' && rentalPriceMonthly && (
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-0.5">Tarif de location</p>
                <p className="text-foreground font-semibold text-xl">
                  {formatPrice(rentalPriceMonthly)}{' '}
                  <span className="text-sm font-normal text-muted">/ mois</span>
                </p>
              </div>
            )}
          </div>

          {(availabilityType === 'SALE' || availabilityType === 'BOTH') && (
            <>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Garanties</p>
                <ul className="space-y-1 text-sm">
                  {SALE_GUARANTEES.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {(availabilityType === 'RENTAL' || availabilityType === 'BOTH') && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Services inclus dans la location</p>
              <ServicesList />
            </div>
          )}

          {isAuthenticated ? (
            <Link
              to={`/submissions/new?vehicle=${vehicle.id}`}
              className="hover-btn bg-primary text-white text-center text-sm font-semibold px-4 py-2 rounded"
            >
              Déposer ma demande
            </Link>
          ) : (
            <Link
              to="/register"
              className="hover-btn bg-primary text-white text-center text-sm font-semibold px-4 py-2 rounded"
            >
              Créer un compte pour constituer mon dossier
            </Link>
          )}

          <Link
            to="/vehicles"
            className="text-sm text-muted hover:text-foreground transition-colors text-center"
          >
            Retour au catalogue
          </Link>
        </div>
      </div>
    </main>
  );
}
