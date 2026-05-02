import axios from 'axios'

const API_BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8082'}/api`

export type Submission = {
  id: number
  type: string
  status: string
  profession: string
  monthlyIncome: string
  monthlyTotal: string | null
  duration: number | null
  annualKm: number | null
  createdAt: string
}

export type DocumentUploadResult = {
  id: number
  documentType: string
  documentUrl: string
  uploadedAt: string
}

export type SubmissionCollection = {
  member: Submission[]
  totalItems: number
}

export async function fetchSubmissions(token: string): Promise<Submission[]> {
  const { data } = await axios.get<SubmissionCollection>(`${API_BASE}/submissions`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.member
}

export interface CreateSubmissionParams {
  vehicleIri: string
  type: string
  profession: string
  monthlyIncome: string
  duration?: number
  annualKm?: number
  monthlyTotal?: string
}

export async function createSubmission(token: string, params: CreateSubmissionParams): Promise<Submission> {
  const { data } = await axios.post<Submission>(
    `${API_BASE}/submissions`,
    {
      vehicle: params.vehicleIri,
      type: params.type,
      profession: params.profession,
      monthlyIncome: params.monthlyIncome,
      ...(params.duration !== undefined && { duration: params.duration }),
      ...(params.annualKm !== undefined && { annualKm: params.annualKm }),
      ...(params.monthlyTotal !== undefined && { monthlyTotal: params.monthlyTotal }),
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/ld+json' } },
  )
  return data
}

export async function uploadDocument(
  token: string,
  submissionId: number,
  file: File,
  documentType: string,
): Promise<DocumentUploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('documentType', documentType)

  const { data } = await axios.post<DocumentUploadResult>(
    `${API_BASE}/submissions/${submissionId}/documents`,
    formData,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return data
}
