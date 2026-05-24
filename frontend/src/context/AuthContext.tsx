import { createContext, useEffect, useState } from 'react'
import apiClient from '../services/api/axiosInstance'

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  roles: string[]
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  updateUser: (user: AuthUser) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState<boolean>(() => !!localStorage.getItem('token'))

  // Au démarrage : si un token existe en localStorage, on vérifie qu'il est encore valide
  useEffect(() => {
    if (!token) return

    apiClient
      .get<AuthUser>('/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        // L'interceptor 401 nettoie déjà le token et redirige vers /login.
        // Ici on reset juste l'état local au cas où l'erreur ne serait pas un 401.
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(newToken: string): Promise<void> {
    localStorage.setItem('token', newToken)
    setToken(newToken)

    const res = await apiClient.get<AuthUser>('/me', {
      headers: { Authorization: `Bearer ${newToken}` },
    })
    setUser(res.data)
  }

  function logout(): void {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  function updateUser(updatedUser: AuthUser): void {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
