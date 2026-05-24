import apiClient from './axiosInstance'

export type SubmissionDocument = {
  id: number
  documentType: string
  documentUrl: string
  uploadedAt: string
}

export type SubmissionVehicle = {
  '@id': string
  id: number
  brand: string
  model: string
  year: number
  imageUrl: string | null
}

export type Submission = {
  id: number
  type: string
  status: string
  profession: string
  monthlyIncome: string
  monthlyTotal: string | null
  duration: number | null
  annualKm: number | null
  rejectionReason: string | null
  createdAt: string
  vehicle: SubmissionVehicle | null
  documents: SubmissionDocument[]
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
  const { data } = await apiClient.get<SubmissionCollection>(`/submissions`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.member
}

export async function fetchSubmission(token: string, id: number): Promise<Submission> {
  const { data } = await apiClient.get<Submission>(`/submissions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
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
  const { data } = await apiClient.post<Submission>(
    `/submissions`,
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

  const { data } = await apiClient.post<DocumentUploadResult>(
    `/submissions/${submissionId}/documents`,
    formData,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return data
}
