import { Link, useSearchParams } from 'react-router-dom'
import { useSubmissions } from '../../hooks/useSubmissions'
import {
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_BADGE_CLASSES,
  SUBMISSION_TYPE_LABELS,
} from '../../constants/labels'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
}

export default function SubmissionsList() {
  const { data: submissions = [], isLoading, isError } = useSubmissions()
  const [searchParams] = useSearchParams()
  const statusFilter = searchParams.get('status')

  const displayed = statusFilter
    ? submissions.filter(s => s.status === statusFilter)
    : submissions

  if (isLoading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-muted text-sm">Chargement...</div>
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-red-600 text-sm">Une erreur est survenue. Veuillez réessayer.</p>
      </div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8">

      <div className="flex flex-col gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors !underline underline-offset-2"
        >
          <span aria-hidden="true">←</span> Retour à Mon espace
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-extrabold text-foreground">Mes dossiers</h1>
          {statusFilter && (
            <span className="text-xs font-medium px-2.5 py-1 rounded bg-gray-100 text-gray-600">
              {SUBMISSION_STATUS_LABELS[statusFilter] ?? statusFilter}
            </span>
          )}
        </div>
        {statusFilter && (
          <Link to="/dashboard/submissions" className="text-xs text-muted hover:text-foreground !underline underline-offset-2">
            Voir tous les dossiers
          </Link>
        )}
      </div>

      {displayed.length === 0 ? (
        <div className="border border-black/10 rounded-lg px-6 py-12 text-center flex flex-col gap-3">
          <p className="text-muted text-sm">
            {statusFilter ? 'Aucun dossier dans cette catégorie.' : 'Vous n\'avez pas encore de dossier.'}
          </p>
          {!statusFilter && (
            <Link
              to="/vehicles"
              className="hover-btn bg-primary text-white font-semibold px-5 py-2 rounded text-sm inline-block mx-auto"
            >
              Chercher un véhicule
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((submission) => (
            <div
              key={submission.id}
              className="border border-black/10 rounded-lg px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
            >
              {submission.vehicle?.imageUrl ? (
                <img
                  src={submission.vehicle.imageUrl}
                  alt={`${submission.vehicle.brand} ${submission.vehicle.model}`}
                  className="w-16 h-12 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-12 bg-gray-100 rounded flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {submission.vehicle
                    ? `${submission.vehicle.brand} ${submission.vehicle.model}`
                    : 'Véhicule inconnu'}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {formatDate(submission.createdAt)}
                </p>
              </div>

              <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600 flex-shrink-0">
                {SUBMISSION_TYPE_LABELS[submission.type] ?? submission.type}
              </span>

              <span
                className={`text-xs font-medium px-2 py-1 rounded flex-shrink-0 ${SUBMISSION_STATUS_BADGE_CLASSES[submission.status] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {SUBMISSION_STATUS_LABELS[submission.status] ?? submission.status}
              </span>

              <Link
                to={`/dashboard/submissions/${submission.id}`}
                className="hover-btn bg-primary text-white font-semibold px-4 py-2 rounded text-xs flex-shrink-0"
              >
                Voir
              </Link>
            </div>
          ))}
        </div>
      )}

    </main>
  )
}
