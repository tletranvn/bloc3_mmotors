import { useState } from 'react'
import { useAuth } from '../../../../hooks/useAuth'
import { createVehicle, updateVehicle, type Vehicle, type VehiclePayload } from '../../../../services/api/vehicleService'
import ImageUploader from '../ImageUploader/ImageUploader'

interface Props {
  vehicle?: Vehicle
  onSuccess: () => void
  onCancel: () => void
}

const FUEL_TYPES = [
  { value: 'GASOLINE', label: 'Essence' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HYBRID', label: 'Hybride' },
  { value: 'ELECTRIC', label: 'Électrique' },
]

const AVAILABILITY_TYPES = [
  { value: 'SALE', label: 'Vente' },
  { value: 'RENTAL', label: 'Location' },
  { value: 'BOTH', label: 'Vente & Location' },
]

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'RESERVED', label: 'Réservé' },
  { value: 'SOLD', label: 'Vendu' },
  { value: 'ON_LEASE', label: 'En location' },
  { value: 'MAINTENANCE', label: 'En maintenance' },
]

function field(label: string, children: React.ReactNode) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'border border-black/15 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-primary'

export default function VehicleForm({ vehicle, onSuccess, onCancel }: Props) {
  const { token } = useAuth()
  const isEdit = !!vehicle

  const [brand, setBrand] = useState(vehicle?.brand ?? '')
  const [model, setModel] = useState(vehicle?.model ?? '')
  const [year, setYear] = useState(String(vehicle?.year ?? new Date().getFullYear()))
  const [mileage, setMileage] = useState(String(vehicle?.mileage ?? '0'))
  const [fuelType, setFuelType] = useState(vehicle?.fuelType ?? 'GASOLINE')
  const [color, setColor] = useState(vehicle?.color ?? '')
  const [availabilityType, setAvailabilityType] = useState(vehicle?.availabilityType ?? 'SALE')
  const [status, setStatus] = useState(vehicle?.status ?? 'AVAILABLE')
  const [description, setDescription] = useState(vehicle?.description ?? '')
  const [imageUrl, setImageUrl] = useState<string | null>(vehicle?.imageUrl ?? null)
  const [salePrice, setSalePrice] = useState(vehicle?.salePrice ?? '')
  const [rentalPriceMonthly, setRentalPriceMonthly] = useState(vehicle?.rentalPriceMonthly ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const showSalePrice = availabilityType === 'SALE' || availabilityType === 'BOTH'
  const showRentalPrice = availabilityType === 'RENTAL' || availabilityType === 'BOTH'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    setError(null)
    setIsSubmitting(true)

    const payload: VehiclePayload = {
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(year, 10),
      mileage: parseInt(mileage, 10),
      fuelType,
      color: color.trim() || null,
      availabilityType,
      status,
      description: description.trim() || null,
      imageUrl,
      salePrice: showSalePrice && salePrice ? salePrice : null,
      rentalPriceMonthly: showRentalPrice && rentalPriceMonthly ? rentalPriceMonthly : null,
    }

    try {
      if (isEdit) {
        await updateVehicle(token, vehicle.id, payload)
      } else {
        await createVehicle(token, payload)
      }
      onSuccess()
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h2 className="font-display text-lg font-bold text-foreground">
        {isEdit ? `Modifier ${vehicle.brand} ${vehicle.model}` : 'Ajouter un véhicule'}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {field('Marque *', (
          <input className={inputCls} value={brand} onChange={e => setBrand(e.target.value)} required />
        ))}
        {field('Modèle *', (
          <input className={inputCls} value={model} onChange={e => setModel(e.target.value)} required />
        ))}
        {field('Année *', (
          <input className={inputCls} type="number" min="1900" max="2100" value={year} onChange={e => setYear(e.target.value)} required />
        ))}
        {field('Kilométrage *', (
          <input className={inputCls} type="number" min="0" value={mileage} onChange={e => setMileage(e.target.value)} required />
        ))}
        {field('Carburant *', (
          <select className={inputCls} value={fuelType} onChange={e => setFuelType(e.target.value)}>
            {FUEL_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        ))}
        {field('Couleur', (
          <input className={inputCls} value={color} onChange={e => setColor(e.target.value)} placeholder="Optionnel" />
        ))}
        {field('Disponibilité *', (
          <select className={inputCls} value={availabilityType} onChange={e => setAvailabilityType(e.target.value)}>
            {AVAILABILITY_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        ))}
        {field('Statut *', (
          <select className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        ))}
        {showSalePrice && field('Prix de vente (€) *', (
          <input className={inputCls} type="number" min="0" step="0.01" value={salePrice} onChange={e => setSalePrice(e.target.value)} required={showSalePrice} />
        ))}
        {showRentalPrice && field('Loyer de référence (€/mois) *', (
          <input className={inputCls} type="number" min="0" step="0.01" value={rentalPriceMonthly} onChange={e => setRentalPriceMonthly(e.target.value)} required={showRentalPrice} />
        ))}
      </div>

      {field('Description', (
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Optionnel"
        />
      ))}

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">Image du véhicule</span>
        <ImageUploader onUpload={url => setImageUrl(url)} currentImageUrl={vehicle?.imageUrl ?? undefined} />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground border border-black/15 rounded"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="hover-btn bg-primary text-white font-semibold px-5 py-2 rounded text-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement…' : isEdit ? 'Enregistrer les modifications' : 'Ajouter le véhicule'}
        </button>
      </div>
    </form>
  )
}
