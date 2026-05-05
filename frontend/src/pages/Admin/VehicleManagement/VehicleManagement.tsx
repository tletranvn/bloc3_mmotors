import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../hooks/useAuth'
import { useVehicles } from '../../../hooks/useVehicles'
import { deleteVehicle, type Vehicle } from '../../../services/api/vehicleService'
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
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {vehicles.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted text-sm">Aucun véhicule.</td>
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
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEdit(v)}
                          className="hover-btn text-xs font-medium px-3 py-1.5 rounded border border-black/15 text-foreground"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => openDelete(v)}
                          className="hover-btn text-xs font-medium px-3 py-1.5 rounded border border-red-200 text-red-600"
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
