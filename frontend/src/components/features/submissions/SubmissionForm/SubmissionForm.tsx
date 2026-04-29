import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../../../hooks/useAuth'
import { createSubmission, uploadDocument } from '../../../../services/api/submissionService'
import type { Vehicle } from '../../../../services/api/vehicleService'

interface Props {
  vehicle: Vehicle
  type: 'SALE' | 'RENTAL'
}

export default function SubmissionForm({ vehicle, type }: Props) {
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [profession, setProfession] = useState('')
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [identityFile, setIdentityFile] = useState<File | null>(null)
  const [addressFile, setAddressFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isFormValid =
    profession.trim() !== '' &&
    monthlyIncome.trim() !== '' &&
    identityFile !== null &&
    addressFile !== null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!token || !user) return

    setIsLoading(true)
    setError(null)

    try {
      const submission = await createSubmission(
        token,
        vehicle['@id'],
        type,
        profession.trim(),
        monthlyIncome.trim(),
      )

      await uploadDocument(token, submission.id, identityFile!, 'IDENTITY')
      await uploadDocument(token, submission.id, addressFile!, 'ADDRESS')

      navigate('/dashboard', { replace: true, state: { successMessage: 'Votre dossier a bien été soumis. Notre équipe vous contactera prochainement.' } })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail ?? err.response?.data?.['hydra:description']
        setError(detail ?? 'Une erreur est survenue. Veuillez réessayer.')
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-foreground">Prénom</label>
          <input
            type="text"
            value={user?.firstName ?? ''}
            readOnly
            className="border border-black/10 rounded px-3 py-2 text-sm bg-gray-50 text-muted cursor-not-allowed"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-foreground">Nom</label>
          <input
            type="text"
            value={user?.lastName ?? ''}
            readOnly
            className="border border-black/10 rounded px-3 py-2 text-sm bg-gray-50 text-muted cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-foreground">Email</label>
        <input
          type="email"
          value={user?.email ?? ''}
          readOnly
          className="border border-black/10 rounded px-3 py-2 text-sm bg-gray-50 text-muted cursor-not-allowed"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="profession" className="text-sm font-semibold text-foreground">
          Profession <span className="text-red-500">*</span>
        </label>
        <input
          id="profession"
          type="text"
          value={profession}
          onChange={(e) => { setProfession(e.target.value); setError(null) }}
          placeholder="Ex : Ingénieur, Infirmier, Commerçant..."
          className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="monthlyIncome" className="text-sm font-semibold text-foreground">
          Revenus mensuels nets (€) <span className="text-red-500">*</span>
        </label>
        <input
          id="monthlyIncome"
          type="number"
          min="0"
          step="0.01"
          value={monthlyIncome}
          onChange={(e) => { setMonthlyIncome(e.target.value); setError(null) }}
          placeholder="Ex : 2500"
          className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-foreground">
          Pièce d'identité <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-muted">PDF, JPG ou PNG — max 5 Mo</p>
        <label className="hover-btn inline-flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2 rounded text-sm cursor-pointer w-fit">
          Choisir un fichier
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setIdentityFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>
        {identityFile
          ? <p className="text-xs text-green-600">{identityFile.name}</p>
          : <p className="text-xs text-muted">Aucun fichier sélectionné</p>
        }
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-foreground">
          Justificatif de domicile <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-muted">PDF, JPG ou PNG — max 5 Mo</p>
        <label className="hover-btn inline-flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2 rounded text-sm cursor-pointer w-fit">
          Choisir un fichier
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setAddressFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>
        {addressFile
          ? <p className="text-xs text-green-600">{addressFile.name}</p>
          : <p className="text-xs text-muted">Aucun fichier sélectionné</p>
        }
      </div>

      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="hover-btn bg-primary text-white font-semibold px-8 py-3 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Envoi en cours...' : 'Soumettre mon dossier'}
      </button>

    </form>
  )
}
