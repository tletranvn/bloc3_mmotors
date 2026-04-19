import { createContext, useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8082'}/api`

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  // Au démarrage : si un token existe en localStorage, on vérifie qu'il est encore valide
  useEffect(() => {
    if (!token) return

    axios
      .get<AuthUser>(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        // Token expiré ou invalide → on nettoie
        localStorage.removeItem('token')
        setToken(null)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(newToken: string): Promise<void> {
    localStorage.setItem('token', newToken)
    setToken(newToken)

    const res = await axios.get<AuthUser>(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
    })
    setUser(res.data)
  }

  function logout(): void {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
