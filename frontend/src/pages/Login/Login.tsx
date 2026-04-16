import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <main className="max-w-lg mx-auto px-4 py-16">
      <div className="bg-surface border border-black/8 rounded-lg p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-extrabold text-foreground">Se connecter</h1>
          <p className="text-sm text-muted">Page en cours de développement (US-009).</p>
        </div>

        <p className="text-sm text-muted text-center">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-foreground font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity">
            S'inscrire
          </Link>
        </p>
      </div>
    </main>
  )
}
