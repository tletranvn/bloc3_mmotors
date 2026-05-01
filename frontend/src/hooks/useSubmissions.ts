import { useQuery } from '@tanstack/react-query'
import { fetchSubmissions } from '../services/api/submissionService'
import { useAuth } from './useAuth'

export function useSubmissions() {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['submissions'],
    queryFn: () => fetchSubmissions(token!),
    enabled: !!token,
  })
}
