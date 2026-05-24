import axios, { type AxiosError } from 'axios'
import * as Sentry from '@sentry/react'

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:8082'}/api`,
})

export function handleApiError(error: AxiosError): Promise<never> {
  const status = error?.response?.status

  if (status === 401) {
    localStorage.removeItem('token')
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  if (status !== undefined && status >= 500) {
    Sentry.captureException(error)
  }

  return Promise.reject(error)
}

apiClient.interceptors.response.use((response) => response, handleApiError)

export default apiClient
