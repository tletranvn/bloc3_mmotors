import { useLocation } from 'react-router-dom'
import LoginForm from '../../components/features/auth/LoginForm/LoginForm'

export default function Login() {
  const location = useLocation()
  const registered = location.state?.registered === true

  return (
    <main className="max-w-lg mx-auto px-4 py-16">
      <div className="bg-surface border border-black/8 rounded-lg p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-extrabold text-foreground">Se connecter</h1>
        </div>

        {registered && (
          <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-4 py-3">
            Compte créé avec succès. Vous pouvez maintenant vous connecter.
          </p>
        )}

        <LoginForm />
      </div>
    </main>
  )
}
