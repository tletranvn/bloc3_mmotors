import { Link } from 'react-router-dom'
import RegisterForm from '../../components/features/auth/RegisterForm/RegisterForm'

export default function Register() {
  return (
    <main className="max-w-lg mx-auto px-4 py-16">
      <div className="bg-surface border border-black/8 rounded-lg p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-extrabold text-foreground">Créer un compte</h1>
          <p className="text-sm text-muted">Accédez à nos offres de vente et de location longue durée.</p>
        </div>

        <RegisterForm />

        <p className="text-sm text-muted text-center">
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-foreground font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  )
}
