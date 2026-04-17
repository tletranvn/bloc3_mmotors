import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../../../../services/api/authService'
import axios from 'axios'

interface FormState {
  email: string
  plainPassword: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  address: string
  rgpdConsent: boolean
}

interface FormErrors {
  email?: string
  plainPassword?: string
  confirmPassword?: string
  firstName?: string
  lastName?: string
  phone?: string
  rgpdConsent?: string
}

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const PHONE_REGEX = /^0[67]\d{8}$/

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}

  if (!form.firstName.trim()) errors.firstName = 'Le prénom est obligatoire.'
  if (!form.lastName.trim()) errors.lastName = 'Le nom est obligatoire.'
  if (!form.email.trim()) {
    errors.email = "L'email est obligatoire."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Format email invalide.'
  }
  if (!form.plainPassword) {
    errors.plainPassword = 'Le mot de passe est obligatoire.'
  } else if (!PASSWORD_REGEX.test(form.plainPassword)) {
    errors.plainPassword = 'Minimum 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial.'
  }
  if (form.confirmPassword !== form.plainPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas.'
  }
  if (!form.phone.trim()) {
    errors.phone = 'Le téléphone est obligatoire.'
  } else if (!PHONE_REGEX.test(form.phone)) {
    errors.phone = 'Format invalide. Exemples : 0612345678, 0712345678.'
  }
  if (!form.rgpdConsent) {
    errors.rgpdConsent = "Vous devez accepter les conditions d'utilisation."
  }

  return errors
}

export default function RegisterForm() {
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>({
    email: '',
    plainPassword: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    rgpdConsent: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const formErrors = validate(form)
  const isFormValid = Object.keys(formErrors).length === 0

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setApiError(null)
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name } = e.target
    const fieldErrors = validate(form)
    if (fieldErrors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name as keyof FormErrors] }))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setApiError(null)

    try {
      await register({
        email: form.email,
        plainPassword: form.plainPassword,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: form.address || undefined,
        rgpdConsent: form.rgpdConsent,
      })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setApiError('Cet email est déjà utilisé.')
      } else {
        setApiError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {apiError && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
          {apiError}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="register-firstName" className="text-sm font-semibold text-foreground">
            Prénom
          </label>
          <input
            id="register-firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
          />
          {errors.firstName && <p className="text-xs text-red-600">{errors.firstName}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="register-lastName" className="text-sm font-semibold text-foreground">
            Nom
          </label>
          <input
            id="register-lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            value={form.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
          />
          {errors.lastName && <p className="text-xs text-red-600">{errors.lastName}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="register-email" className="text-sm font-semibold text-foreground">
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="register-phone" className="text-sm font-semibold text-foreground">
          Téléphone
        </label>
        <input
          id="register-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="0612345678"
          value={form.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
        />
        {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="register-address" className="text-sm font-semibold text-foreground">
          Adresse <span className="text-muted font-normal">(optionnel)</span>
        </label>
        <input
          id="register-address"
          name="address"
          type="text"
          autoComplete="street-address"
          value={form.address}
          onChange={handleChange}
          className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="register-plainPassword" className="text-sm font-semibold text-foreground">
          Mot de passe
        </label>
        <input
          id="register-plainPassword"
          name="plainPassword"
          type="password"
          autoComplete="new-password"
          value={form.plainPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
        />
        {errors.plainPassword && <p className="text-xs text-red-600">{errors.plainPassword}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="register-confirmPassword" className="text-sm font-semibold text-foreground">
          Confirmer le mot de passe
        </label>
        <input
          id="register-confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
        />
        {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            id="register-rgpdConsent"
            name="rgpdConsent"
            type="checkbox"
            checked={form.rgpdConsent}
            onChange={handleChange}
            className="mt-0.5 accent-primary"
          />
          <span className="text-sm text-foreground">
            J'accepte les{' '}
            <a href="/conditions" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
              conditions d'utilisation
            </a>{' '}
            et la politique de confidentialité (RGPD).
          </span>
        </label>
        {errors.rgpdConsent && <p className="text-xs text-red-600">{errors.rgpdConsent}</p>}
      </div>

      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="hover-btn bg-primary text-white font-semibold px-8 py-3 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Inscription en cours...' : "S'inscrire"}
      </button>

    </form>
  )
}
