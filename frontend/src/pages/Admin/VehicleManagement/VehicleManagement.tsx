import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../hooks/useAuth'
import { useVehicles } from '../../../hooks/useVehicles'
import { deleteVehicle, toggleVehicleAvailability, updateVehicle, type Vehicle } from '../../../services/api/vehicleService'
import VehicleForm from '../../../components/features/admin/VehicleForm/VehicleForm'
import ConfirmDeleteModal from '../../../components/features/admin/ConfirmDeleteModal/ConfirmDeleteModal'
import {
  FUEL_TYPE_LABELS,
  VEHICLE_STATUS_LABELS,
  AVAILABILITY_TYPE_LABELS,
} from '../../../constants/labels'

type FormMode = 'create' | 'edit' | null

function formatPrice(value: string | null) {
  if (!value) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(parseFloat(value))
}

export default function VehicleManagement() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useVehicles(page)

  const [formMode, setFormMode] = useState<FormMode>(null)
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [isToggling, setIsToggling] = useState(false)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [toggleSuccess, setToggleSuccess] = useState<string | null>(null)
  const [priceModalVehicle, setPriceModalVehicle] = useState<Vehicle | null>(null)
  const [priceInput, setPriceInput] = useState('')
  const [isSavingPrice, setIsSavingPrice] = useState(false)

  const vehicles = data?.member ?? []
  const totalItems = data?.totalItems ?? 0
  const totalPages = Math.ceil(totalItems / 12)

  function openCreate() {
    setEditVehicle(null)
    setFormMode('create')
  }

  function openEdit(vehicle: Vehicle) {
    setEditVehicle(vehicle)
    setFormMode('edit')
  }

  function closeForm() {
    setFormMode(null)
    setEditVehicle(null)
  }

  function handleFormSuccess() {
    queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    closeForm()
  }

  function openDelete(vehicle: Vehicle) {
    setDeleteTarget(vehicle)
    setDeleteError(null)
  }

  function needsPriceForToggle(v: Vehicle): { needed: boolean; field: 'rental' | 'sale' | null } {
    if ((v.availabilityType === 'SALE' || v.availabilityType === 'BOTH') && !v.rentalPriceMonthly) {
      return { needed: true, field: 'rental' }
    }
    if (v.availabilityType === 'RENTAL' && !v.salePrice) {
      return { needed: true, field: 'sale' }
    }
    return { needed: false, field: null }
  }

  async function executeToggle(v: Vehicle): Promise<boolean> {
    if (!token) return false
    setIsToggling(true)
    setToggleError(null)
    setToggleSuccess(null)
    try {
      const updated = await toggleVehicleAvailability(token, v.id)
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setToggleSuccess(`${updated.brand} ${updated.model} basculé en ${AVAILABILITY_TYPE_LABELS[updated.availabilityType] ?? updated.availabilityType}.`)
      setTimeout(() => setToggleSuccess(null), 4000)
      return true
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      if (status === 409) {
        setToggleError(msg ?? 'Impossible : un dossier est en cours (PENDING ou APPROVED).')
      } else {
        setToggleError(msg ?? 'Une erreur est survenue. Veuillez réessayer.')
      }
      return false
    } finally {
      setIsToggling(false)
    }
  }

  function handleToggle(v: Vehicle) {
    setToggleError(null)
    if (v.activeSubmissionsCount > 0) {
      executeToggle(v)
      return
    }
    const { needed, field } = needsPriceForToggle(v)
    if (needed) {
      setPriceModalVehicle(v)
      setPriceInput(field === 'rental' ? (v.rentalPriceMonthly ?? '') : (v.salePrice ?? ''))
    } else {
      executeToggle(v)
    }
  }

  async function handleConfirmPriceAndToggle() {
    if (!priceModalVehicle || !token) return
    const price = parseFloat(priceInput)
    if (isNaN(price) || price <= 0) return
    setIsSavingPrice(true)

    const vehicleId = priceModalVehicle.id
    const { needed, field } = needsPriceForToggle(priceModalVehicle)

    try {
      if (!needed) { setPriceModalVehicle(null); return }

      const payload = {
        brand: priceModalVehicle.brand,
        model: priceModalVehicle.model,
        year: priceModalVehicle.year,
        mileage: priceModalVehicle.mileage,
        fuelType: priceModalVehicle.fuelType,
        color: priceModalVehicle.color,
        availabilityType: priceModalVehicle.availabilityType,
        status: priceModalVehicle.status,
        description: priceModalVehicle.description,
        imageUrl: priceModalVehicle.imageUrl,
        salePrice: field === 'sale' ? String(price) : priceModalVehicle.salePrice,
        rentalPriceMonthly: field === 'rental' ? String(price) : priceModalVehicle.rentalPriceMonthly,
      }

      const rollbackPayload = {
        ...payload,
        salePrice: field === 'sale' ? priceModalVehicle.salePrice : payload.salePrice,
        rentalPriceMonthly: field === 'rental' ? priceModalVehicle.rentalPriceMonthly : payload.rentalPriceMonthly,
      }

      await updateVehicle(token, vehicleId, payload)
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })

      const vehicleWithPrice = { ...priceModalVehicle, ...payload }
      setPriceModalVehicle(null)
      setPriceInput('')

      const toggled = await executeToggle(vehicleWithPrice as Vehicle)

      if (!toggled) {
        try {
          await updateVehicle(token, vehicleId, rollbackPayload)
        } finally {
          queryClient.invalidateQueries({ queryKey: ['vehicles'] })
        }
      }
    } catch {
      setToggleError('Erreur lors de la mise à jour du prix.')
    } finally {
      setIsSavingPrice(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || !token) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteVehicle(token, deleteTarget.id)
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setDeleteTarget(null)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        setDeleteError('Ce véhicule ne peut pas être supprimé car il est lié à des dossiers actifs.')
      } else {
        setDeleteError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 flex flex-col gap-8">

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-foreground">Gestion des véhicules</h1>
        <button
          onClick={openCreate}
          className="hover-btn bg-primary text-white font-semibold px-5 py-2 rounded text-sm"
        >
          + Ajouter un véhicule
        </button>
      </div>

      {toggleSuccess && (
        <div role="status" className="bg-green-50 border border-green-200 rounded-lg px-5 py-3">
          <p className="text-sm text-green-700">{toggleSuccess}</p>
        </div>
      )}

      {toggleError && (
        <div role="alert" className="bg-orange-50 border border-orange-200 rounded-lg px-5 py-3">
          <p className="text-sm text-orange-700">{toggleError}</p>
        </div>
      )}

      {deleteError && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-5 py-3">
          <p className="text-sm text-red-700">{deleteError}</p>
        </div>
      )}

      {isLoading && <p className="text-muted text-sm">Chargement...</p>}
      {isError && <p className="text-red-600 text-sm">Une erreur est survenue.</p>}

      {!isLoading && !isError && (
        <>
          <div className="border border-black/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-black/10">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Véhicule</th>
                  <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Carburant</th>
                  <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Disponibilité</th>
                  <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Prix vente</th>
                  <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Loyer réf.</th>
                  <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Dossiers</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {vehicles.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted text-sm">Aucun véhicule.</td>
                  </tr>
                )}
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{v.brand} {v.model}</p>
                      <p className="text-xs text-muted">{v.year} · {v.mileage.toLocaleString('fr-FR')} km</p>
                    </td>
                    <td className="px-4 py-3 text-foreground">{FUEL_TYPE_LABELS[v.fuelType] ?? v.fuelType}</td>
                    <td className="px-4 py-3 text-foreground">{AVAILABILITY_TYPE_LABELS[v.availabilityType] ?? v.availabilityType}</td>
                    <td className="px-4 py-3 text-foreground">{formatPrice(v.salePrice)}</td>
                    <td className="px-4 py-3 text-foreground">{formatPrice(v.rentalPriceMonthly)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600">
                        {VEHICLE_STATUS_LABELS[v.status] ?? v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {v.activeSubmissionsCount > 0 ? (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-orange-100 text-orange-700">
                          {v.activeSubmissionsCount} actif{v.activeSubmissionsCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEdit(v)}
                          disabled={v.activeSubmissionsCount > 0}
                          title={v.activeSubmissionsCount > 0 ? 'Modification impossible : dossier(s) en cours' : undefined}
                          className="hover-btn text-xs font-medium px-3 py-1.5 rounded border border-black/15 text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleToggle(v)}
                          disabled={isToggling || v.activeSubmissionsCount > 0}
                          title={v.activeSubmissionsCount > 0 ? 'Basculer impossible : dossier(s) en cours' : undefined}
                          className="hover-btn text-xs font-medium px-3 py-1.5 rounded border border-blue-200 text-blue-600 disabled:border-blue-100 disabled:text-blue-300 disabled:cursor-not-allowed"
                        >
                          Basculer
                        </button>
                        <button
                          onClick={() => openDelete(v)}
                          disabled={v.activeSubmissionsCount > 0}
                          title={v.activeSubmissionsCount > 0 ? 'Suppression impossible : dossier(s) en cours' : undefined}
                          className="hover-btn text-xs font-medium px-3 py-1.5 rounded border border-red-200 text-red-600 disabled:border-red-100 disabled:text-red-300 disabled:cursor-not-allowed"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-black/15 rounded disabled:opacity-40"
              >
                ←
              </button>
              <span className="text-sm text-muted">Page {page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-black/15 rounded disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal formulaire */}
      {formMode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-12">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6">
            <VehicleForm
              vehicle={editVehicle ?? undefined}
              onSuccess={handleFormSuccess}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}

      {/* Modal saisie prix manquant */}
      {priceModalVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6 flex flex-col gap-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              Prix requis pour basculer
            </h2>
            <p className="text-sm text-muted">
              {needsPriceForToggle(priceModalVehicle).field === 'rental'
                ? 'Définissez le loyer mensuel (€) avant de basculer en Location.'
                : 'Définissez le prix de vente (€) avant de basculer en Vente.'}
            </p>
            <input
              type="number"
              min="1"
              step="0.01"
              value={priceInput}
              onChange={e => setPriceInput(e.target.value)}
              placeholder={needsPriceForToggle(priceModalVehicle).field === 'rental' ? 'Ex : 450' : 'Ex : 18500'}
              className="border border-black/15 rounded px-3 py-2 text-sm w-full"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setPriceModalVehicle(null); setPriceInput('') }}
                className="hover-btn text-sm font-medium px-4 py-2 rounded border border-black/15 text-foreground"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmPriceAndToggle}
                disabled={isSavingPrice || !priceInput || parseFloat(priceInput) <= 0}
                className="hover-btn text-sm font-medium px-4 py-2 rounded bg-primary text-white disabled:opacity-40"
              >
                {isSavingPrice ? 'Enregistrement...' : 'Confirmer et basculer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteTarget && (
        <ConfirmDeleteModal
          vehicleName={`${deleteTarget.brand} ${deleteTarget.model}`}
          onConfirm={handleConfirmDelete}
          onCancel={() => { setDeleteTarget(null); setDeleteError(null) }}
          isDeleting={isDeleting}
        />
      )}

    </main>
  )
}
