import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { AuthProvider } from './AuthContext'
import { useAuth } from '../hooks/useAuth'

vi.mock('axios')
const mockedAxios = vi.mocked(axios)

const mockUser = {
  id: 1,
  email: 'jean@email.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  roles: ['ROLE_USER'],
}

function TestConsumer() {
  const { isAuthenticated, user, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'connecté' : 'déconnecté'}</span>
      <span data-testid="user-name">{user?.firstName ?? ''}</span>
      <button onClick={() => login('fake-token')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('AuthContext', () => {

  it('isAuthenticated est false par défaut (pas de token)', () => {
    mockedAxios.get = vi.fn()
    renderWithProvider()
    expect(screen.getByTestId('auth-status')).toHaveTextContent('déconnecté')
  })

  it('login() stocke le token et charge le user via /me', async () => {
    const user = userEvent.setup()
    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockUser })

    renderWithProvider()
    await user.click(screen.getByRole('button', { name: 'login' }))

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('connecté')
    })
    expect(localStorage.getItem('token')).toBe('fake-token')
    expect(screen.getByTestId('user-name')).toHaveTextContent('Jean')
  })

  it('logout() vide le token et le user', async () => {
    const user = userEvent.setup()
    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockUser })

    renderWithProvider()

    await user.click(screen.getByRole('button', { name: 'login' }))
    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('connecté'))

    await user.click(screen.getByRole('button', { name: 'logout' }))

    expect(screen.getByTestId('auth-status')).toHaveTextContent('déconnecté')
    expect(localStorage.getItem('token')).toBeNull()
  })

})
