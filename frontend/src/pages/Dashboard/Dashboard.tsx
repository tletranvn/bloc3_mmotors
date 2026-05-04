import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSubmissions } from '../../hooks/useSubmissions'

export default function Dashboard() {
  const { user } = useAuth()
  const { data: submissions = [], isLoading } = useSubmissions()
  const location = useLocation()
  const successMessage = (location.state as { successMessage?: string })?.successMessage

  const pending  = submissions.filter(s => s.status === 'PENDING').length
  const approved = submissions.filter(s => s.status === 'APPROVED').length
  const rejected = submissions.filter(s => s.status === 'REJECTED').length

  const stats = [
    { label: 'En attente', count: pending,  color: 'text-yellow-600 bg-yellow-50 border-yellow-200', status: 'PENDING'   },
    { label: 'Validés',    count: approved, color: 'text-green-700 bg-green-50 border-green-200',   status: 'APPROVED'  },
    { label: 'Refusés',    count: rejected, color: 'text-red-600 bg-red-50 border-red-200',         status: 'REJECTED'  },
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-10">

      {successMessage && (
        <div role="alert" className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-5 py-4 text-sm font-medium">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-extrabold text-foreground">
          Bonjour {user?.firstName} {user?.lastName} !
        </h1>
        <p className="text-muted text-sm">{user?.email}</p>
      </div>

      <section aria-label="Mes dossiers">
        <div className="flex items-center justify-between mb-4">
          <Link to="/dashboard/submissions" className="font-display text-lg font-bold text-foreground hover:opacity-70 !underline underline-offset-2">
            Mes dossiers
          </Link>
        </div>
        {isLoading ? (
          <p className="text-muted text-sm">Chargement...</p>
        ) : (
          <>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 list-none p-0">
              {stats.map(({ label, count, color, status }) => (
                <li key={label}>
                  <Link
                    to={`/dashboard/submissions?status=${status}`}
                    className={`border rounded-lg px-6 py-5 flex flex-col gap-1 hover:opacity-80 transition-opacity ${color}`}
                  >
                    <span className="text-3xl font-extrabold font-display">{count}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {submissions.length === 0 && (
              <p className="text-muted text-sm mt-4">
                Vous n'avez pas encore de dossier. Commencez votre recherche !
              </p>
            )}
          </>
        )}
      </section>

      <section aria-label="Accès rapides">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Accès rapides</h2>
        <ul className="flex flex-col sm:flex-row gap-3 list-none p-0">
          <li>
            <Link
              to="/vehicles"
              className="hover-btn block bg-primary text-white font-semibold px-6 py-3 rounded text-sm text-center"
            >
              Chercher un véhicule
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className="hover-btn block bg-surface border border-black/10 text-foreground font-semibold px-6 py-3 rounded text-sm text-center"
            >
              Mon profil
            </Link>
          </li>
        </ul>
      </section>

    </main>
  )
}
