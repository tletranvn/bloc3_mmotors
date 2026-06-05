import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../../../hooks/useAuth'
import { useRentalCalculator } from '../../../../hooks/useRentalCalculator'
import { createSubmission, uploadDocument } from '../../../../services/api/submissionService'
import type { Vehicle } from '../../../../services/api/vehicleService'
import ServiceCheckboxes from '../ServiceCheckboxes/ServiceCheckboxes'

const DURATION_OPTIONS = [
  { value: 24, label: '24 mois (+10%)' },
  { value: 36, label: '36 mois (prix de base)' },
  { value: 48, label: '48 mois (-5%)' },
]

const KM_OPTIONS = [
  { value: 10000, label: '10 000 km/an' },
  { value: 15000, label: '15 000 km/an (+15 €/mois)' },
  { value: 20000, label: '20 000 km/an (+30 €/mois)' },
  { value: 25000, label: '25 000 km/an (+50 €/mois)' },
]

function formatPrice(value: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(parseFloat(value))
}

interface Props {
  vehicle: Vehicle
  type: 'SALE' | 'RENTAL'
}

export default function SubmissionForm({ vehicle, type }: Props) {
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [profession, setProfession] = useState('')
  const [monthlyIncome, setMonthlyIncome] = useState('')

  // Documents communs
  const [identityFile, setIdentityFile] = useState<File | null>(null)
  const [addressFile, setAddressFile] = useState<File | null>(null)

  // Champs et documents spécifiques RENTAL
  const [duration, setDuration] = useState(36)
  const [annualKm, setAnnualKm] = useState(10000)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [ribFile, setRibFile] = useState<File | null>(null)
  const [payslip1, setPayslip1] = useState<File | null>(null)
  const [payslip2, setPayslip2] = useState<File | null>(null)
  const [payslip3, setPayslip3] = useState<File | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const calculatedMonthly = useRentalCalculator(vehicle.rentalPriceMonthly, duration, annualKm, selectedServices)

  const isFormValid =
    profession.trim() !== '' &&
    monthlyIncome.trim() !== '' &&
    identityFile !== null &&
    addressFile !== null &&
    (type === 'SALE' || (ribFile !== null && payslip1 !== null && payslip2 !== null && payslip3 !== null))

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!token || !user) return

    setIsLoading(true)
    setError(null)

    try {
      const submission = await createSubmission(token, {
        vehicleIri: vehicle['@id'],
        type,
        profession: profession.trim(),
        monthlyIncome: monthlyIncome.trim(),
        ...(type === 'RENTAL' && {
          duration,
          annualKm,
          monthlyTotal: calculatedMonthly ?? undefined,
          services: selectedServices,
        }),
      })

      await uploadDocument(token, submission.id, identityFile!, 'IDENTITY')
      await uploadDocument(token, submission.id, addressFile!, 'ADDRESS')

      if (type === 'RENTAL') {
        await uploadDocument(token, submission.id, ribFile!, 'RIB')
        await uploadDocument(token, submission.id, payslip1!, 'PAYSLIP')
        await uploadDocument(token, submission.id, payslip2!, 'PAYSLIP')
        await uploadDocument(token, submission.id, payslip3!, 'PAYSLIP')
      }

      navigate('/dashboard/submissions', {
        replace: true,
        state: { successMessage: 'Votre dossier a bien été soumis. Notre équipe vous contactera prochainement.' },
      })
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

      {type === 'RENTAL' && (
        <div className="flex flex-col gap-5 border border-black/10 rounded-lg p-5">
          <p className="text-sm font-semibold text-foreground">Paramètres de location</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="duration" className="text-sm font-semibold text-foreground">
                Durée <span className="text-red-500">*</span>
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="annualKm" className="text-sm font-semibold text-foreground">
                Kilométrage annuel <span className="text-red-500">*</span>
              </label>
              <select
                id="annualKm"
                value={annualKm}
                onChange={(e) => setAnnualKm(Number(e.target.value))}
                className="border border-black/10 rounded px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                {KM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <ServiceCheckboxes selectedServices={selectedServices} onChange={setSelectedServices} />

          {calculatedMonthly && (
            <div className="bg-gray-50 border border-black/10 rounded px-4 py-3">
              <p className="text-xs text-muted mb-1">Loyer mensuel estimé</p>
              <p className="text-foreground font-bold text-lg">
                {formatPrice(calculatedMonthly)}<span className="text-sm font-normal text-muted">/mois</span>
              </p>
              <p className="text-xs text-muted mt-1">Durée, kilométrage et services optionnels inclus</p>
            </div>
          )}
        </div>
      )}

      <FileInput
        label="Pièce d'identité"
        required
        file={identityFile}
        onChange={setIdentityFile}
        onError={() => setError(null)}
      />

      <FileInput
        label="Justificatif de domicile"
        required
        file={addressFile}
        onChange={setAddressFile}
        onError={() => setError(null)}
      />

      {type === 'RENTAL' && (
        <>
          <FileInput
            label="RIB (relevé d'identité bancaire)"
            required
            file={ribFile}
            onChange={setRibFile}
            onError={() => setError(null)}
          />
          <FileInput
            label="Bulletin de salaire — mois 1"
            required
            file={payslip1}
            onChange={setPayslip1}
            onError={() => setError(null)}
          />
          <FileInput
            label="Bulletin de salaire — mois 2"
            required
            file={payslip2}
            onChange={setPayslip2}
            onError={() => setError(null)}
          />
          <FileInput
            label="Bulletin de salaire — mois 3"
            required
            file={payslip3}
            onChange={setPayslip3}
            onError={() => setError(null)}
          />
        </>
      )}

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

interface FileInputProps {
  label: string
  required?: boolean
  file: File | null
  onChange: (file: File | null) => void
  onError: () => void
}

function FileInput({ label, required, file, onChange, onError }: FileInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-xs text-muted">PDF, JPG ou PNG — max 5 Mo</p>
      <label className="hover-btn inline-flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2 rounded text-sm cursor-pointer w-fit">
        Choisir un fichier
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => { onChange(e.target.files?.[0] ?? null); onError() }}
          className="hidden"
        />
      </label>
      {file
        ? <p className="text-xs text-green-600">{file.name}</p>
        : <p className="text-xs text-muted">Aucun fichier sélectionné</p>
      }
    </div>
  )
}
