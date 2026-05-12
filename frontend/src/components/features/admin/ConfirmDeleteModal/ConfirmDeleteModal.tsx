interface Props {
  vehicleName: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export default function ConfirmDeleteModal({ vehicleName, onConfirm, onCancel, isDeleting = false }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2 id="confirm-delete-title" className="font-display text-lg font-bold text-foreground">
            Supprimer ce véhicule ?
          </h2>
          <p className="text-sm text-muted">
            Vous êtes sur le point de supprimer <span className="font-semibold text-foreground">{vehicleName}</span>.
            Cette action est irréversible.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground border border-black/15 rounded disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="hover-btn bg-red-600 text-white font-semibold px-5 py-2 rounded text-sm disabled:opacity-50"
          >
            {isDeleting ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  )
}
