import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface StatCard {
  label: string
  count: number
  color: string
}

const stats: StatCard[] = [
  { label: 'En attente', count: 0, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { label: 'Validés', count: 0, color: 'text-green-700 bg-green-50 border-green-200' },
  { label: 'Refusés', count: 0, color: 'text-red-600 bg-red-50 border-red-200' },
]

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-10">

      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-extrabold text-foreground">
          Bonjour {user?.firstName} {user?.lastName} !
        </h1>
        <p className="text-muted text-sm">{user?.email}</p>
      </div>

      <section aria-label="Mes dossiers">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Mes dossiers</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 list-none p-0">
          {stats.map(({ label, count, color }) => (
            <li
              key={label}
              className={`border rounded-lg px-6 py-5 flex flex-col gap-1 ${color}`}
            >
              <span className="text-3xl font-extrabold font-display">{count}</span>
              <span className="text-sm font-medium">{label}</span>
            </li>
          ))}
        </ul>
        {stats.every(s => s.count === 0) && (
          <p className="text-muted text-sm mt-4">
            Vous n'avez pas encore de dossier. Commencez votre recherche !
          </p>
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
