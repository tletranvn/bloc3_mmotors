import { useSearchParams, Link } from 'react-router-dom'
import { useVehicle } from '../../hooks/useVehicle'
import SubmissionForm from '../../components/features/submissions/SubmissionForm/SubmissionForm'
import { FUEL_TYPE_LABELS, AVAILABILITY_TYPE_LABELS } from '../../constants/labels'

function formatPrice(price: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Number.parseFloat(price))
}

export default function SubmissionPage() {
  const [searchParams] = useSearchParams()
  const vehicleId = searchParams.get('vehicle')
  const type = (searchParams.get('type') ?? 'SALE') as 'SALE' | 'RENTAL'

  const { data: vehicle, isLoading, isError } = useVehicle(Number(vehicleId))

  if (!vehicleId) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-muted">Aucun véhicule sélectionné.</p>
        <Link to="/vehicles" className="text-foreground font-semibold underline mt-4 inline-block">
          Retour au catalogue
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return <div className="max-w-xl mx-auto py-16 text-center text-muted">Chargement...</div>
  }

  if (isError || !vehicle) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-muted">Véhicule introuvable.</p>
        <Link to="/vehicles" className="text-foreground font-semibold underline mt-4 inline-block">
          Retour au catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground mb-8">Déposer ma demande</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <aside className="md:col-span-1">
          <div className="border border-black/10 rounded-lg p-5 flex flex-col gap-3">
            {vehicle.imageUrl && (
              <img
                src={vehicle.imageUrl}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-40 object-cover rounded"
              />
            )}
            <div>
              <p className="font-semibold text-foreground text-lg">{vehicle.brand} {vehicle.model}</p>
              <p className="text-sm text-muted">{vehicle.year} — {FUEL_TYPE_LABELS[vehicle.fuelType] ?? vehicle.fuelType}</p>
            </div>
            <div className="text-xs text-muted border-t border-black/10 pt-3 flex flex-col gap-1">
              <span>Type : {AVAILABILITY_TYPE_LABELS[vehicle.availabilityType] ?? vehicle.availabilityType}</span>
              {vehicle.salePrice && (
                <span className="font-semibold text-foreground text-sm">
                  Prix : {formatPrice(vehicle.salePrice)}
                </span>
              )}
              {vehicle.rentalPriceMonthly && (
                <span className="font-semibold text-foreground text-sm">
                  Loyer de base : {formatPrice(vehicle.rentalPriceMonthly)} / mois
                </span>
              )}
              {vehicle.rentalPriceMonthly && (
                <span className="text-xs text-muted">(référence 36 mois / 10 000 km)</span>
              )}
            </div>
            <Link
              to={`/vehicles/${vehicle.id}`}
              className="text-xs text-muted underline underline-offset-2 hover:opacity-70"
            >
              Retour à la fiche véhicule
            </Link>
          </div>
        </aside>

        <main className="md:col-span-2">
          <SubmissionForm vehicle={vehicle} type={type} />
        </main>

      </div>
    </div>
  )
}
