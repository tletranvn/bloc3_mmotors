import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { updateProfile } from '../../services/api/authService'
import axios from 'axios'

export default function Profile() {
  const { user, token, updateUser } = useAuth()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [address, setAddress] = useState(user?.address ?? '')

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)
    setError(null)

    try {
      const updated = await updateProfile(
        user!.id,
        { firstName, lastName, phone, address: address || undefined },
        token!,
      )
      updateUser(updated)
      setSuccess(true)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setError('Données invalides. Vérifiez le format du téléphone.')
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-surface border border-black/8 rounded-lg p-8 flex flex-col gap-6">

        <h1 className="font-display text-2xl font-extrabold text-foreground">Mon profil</h1>

        {success && (
          <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-4 py-3">
            Profil mis à jour avec succès.
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

          <div className="flex flex-col gap-1">
            <label htmlFor="profile-email" className="text-sm font-semibold text-foreground">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="border border-black/10 rounded px-3 py-2 text-sm text-muted bg-black/5 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="profile-firstName" className="text-sm font-semibold text-foreground">
              Prénom
            </label>
            <input
              id="profile-firstName"
              type="text"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setSuccess(false) }}
              className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="profile-lastName" className="text-sm font-semibold text-foreground">
              Nom
            </label>
            <input
              id="profile-lastName"
              type="text"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setSuccess(false) }}
              className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="profile-phone" className="text-sm font-semibold text-foreground">
              Téléphone
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setSuccess(false) }}
              className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="profile-address" className="text-sm font-semibold text-foreground">
              Adresse
            </label>
            <textarea
              id="profile-address"
              rows={3}
              value={address}
              onChange={(e) => { setAddress(e.target.value); setSuccess(false) }}
              className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="hover-btn bg-primary text-white font-semibold px-8 py-3 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>

        </form>
      </div>
    </main>
  )
}
