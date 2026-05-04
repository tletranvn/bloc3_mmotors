import { useQuery } from '@tanstack/react-query'
import { fetchSubmission } from '../services/api/submissionService'
import { useAuth } from './useAuth'

export function useSubmission(id: number) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['submission', id],
    queryFn: () => fetchSubmission(token!, id),
    enabled: !!token && id > 0,
  })
}
