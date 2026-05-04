import { Link, useParams } from 'react-router-dom'
import { useSubmission } from '../../hooks/useSubmission'
import {
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_BADGE_CLASSES,
  SUBMISSION_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS,
} from '../../constants/labels'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
}

function formatPrice(value: string): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(parseFloat(value))
}

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: submission, isLoading, isError } = useSubmission(Number(id))

  if (isLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-12 text-muted text-sm">Chargement...</div>
  }

  if (isError || !submission) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-red-600 text-sm">Dossier introuvable.</p>
        <Link to="/dashboard/submissions" className="text-sm text-muted !underline mt-3 inline-block">
          Retour à mes dossiers
        </Link>
      </div>
    )
  }

  const statusBadge = (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded ${SUBMISSION_STATUS_BADGE_CLASSES[submission.status] ?? 'bg-gray-100 text-gray-600'}`}>
      {SUBMISSION_STATUS_LABELS[submission.status] ?? submission.status}
    </span>
  )

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-8">

      <div className="flex flex-col gap-4">
        <Link
          to="/dashboard/submissions"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors !underline underline-offset-2"
        >
          <span aria-hidden="true">←</span> Retour à Mes dossiers
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-extrabold text-foreground">
            Dossier #{submission.id}
          </h1>
          <p className="text-sm text-muted">Soumis le {formatDate(submission.createdAt)}</p>
        </div>
      </div>

      {/* Statut en rouge si refusé */}
      {submission.status === 'REJECTED' && submission.rejectionReason && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-5 py-4">
          <p className="text-sm font-semibold text-red-700 mb-1">Dossier refusé</p>
          <p className="text-sm text-red-600">{submission.rejectionReason}</p>
        </div>
      )}

      {/* Véhicule */}
      {submission.vehicle && (
        <section className="border border-black/10 rounded-lg p-5 flex items-center gap-4">
          {submission.vehicle.imageUrl && (
            <img
              src={submission.vehicle.imageUrl}
              alt={`${submission.vehicle.brand} ${submission.vehicle.model}`}
              className="w-20 h-14 object-cover rounded flex-shrink-0"
            />
          )}
          <div>
            <p className="font-semibold text-foreground">
              {submission.vehicle.brand} {submission.vehicle.model}
            </p>
            <p className="text-xs text-muted mt-0.5">{submission.vehicle.year}</p>
          </div>
        </section>
      )}

      {/* Infos dossier */}
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold text-foreground text-sm">Informations du dossier</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-muted text-xs uppercase tracking-wide">Type</dt>
            <dd className="font-medium text-foreground mt-0.5">
              {SUBMISSION_TYPE_LABELS[submission.type] ?? submission.type}
            </dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase tracking-wide">Statut</dt>
            <dd className="mt-0.5">{statusBadge}</dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase tracking-wide">Profession</dt>
            <dd className="font-medium text-foreground mt-0.5">{submission.profession}</dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase tracking-wide">Revenus mensuels</dt>
            <dd className="font-medium text-foreground mt-0.5">{formatPrice(submission.monthlyIncome)}</dd>
          </div>
        </dl>
      </section>

      {/* Section location si RENTAL */}
      {submission.type === 'RENTAL' && submission.duration && submission.annualKm && (
        <section className="border border-black/10 rounded-lg p-5 flex flex-col gap-3">
          <h2 className="font-semibold text-foreground text-sm">Paramètres de location</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted text-xs uppercase tracking-wide">Durée</dt>
              <dd className="font-medium text-foreground mt-0.5">{submission.duration} mois</dd>
            </div>
            <div>
              <dt className="text-muted text-xs uppercase tracking-wide">Kilométrage annuel</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {submission.annualKm.toLocaleString('fr-FR')} km/an
              </dd>
            </div>
            {submission.monthlyTotal && (
              <div className="col-span-2">
                <dt className="text-muted text-xs uppercase tracking-wide">Loyer mensuel</dt>
                <dd className="font-bold text-foreground text-lg mt-0.5">
                  {formatPrice(submission.monthlyTotal)}<span className="text-sm font-normal text-muted">/mois</span>
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Documents */}
      {submission.documents.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-foreground text-sm">Documents fournis</h2>
          <ul className="flex flex-col gap-2">
            {submission.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between border border-black/10 rounded px-4 py-3 text-sm">
                <span className="text-foreground font-medium">
                  {DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType}
                </span>
                <a
                  href={doc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted !underline underline-offset-2 hover:opacity-70"
                >
                  Télécharger
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

    </main>
  )
}
