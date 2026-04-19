import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login } from '../../../../services/api/authService'
import { useAuth } from '../../../../hooks/useAuth'
import axios from 'axios'

export default function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login: authLogin } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isFormValid = email.trim() !== '' && password.trim() !== ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const token = await login(email, password)
      await authLogin(token)
      // Redirige vers la page demandée avant le login, ou /dashboard par défaut
      const from = (location.state as { from?: string })?.from ?? '/dashboard'
      navigate(from, { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Email ou mot de passe incorrect.')
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="login-email" className="text-sm font-semibold text-foreground">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null) }}
          className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="login-password" className="text-sm font-semibold text-foreground">
          Mot de passe
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null) }}
          className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>

      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="hover-btn bg-primary text-white font-semibold px-8 py-3 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
      </button>

      <p className="text-sm text-muted text-center">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-foreground font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity">
          S'inscrire
        </Link>
      </p>

    </form>
  )
}
