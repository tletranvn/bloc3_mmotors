import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginForm from './LoginForm'
import * as authService from '../../../../services/api/authService'
import * as useAuthModule from '../../../../hooks/useAuth'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../../../services/api/authService')
vi.mock('../../../../hooks/useAuth')

const mockAuthLogin = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    isAuthenticated: false,
    user: null,
    token: null,
    login: mockAuthLogin,
    logout: vi.fn(),
  })
})

function renderForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  )
}

describe('LoginForm', () => {

  it('affiche les champs email et password', () => {
    renderForm()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
  })

  it('affiche une erreur si les credentials sont invalides (401)', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'login').mockRejectedValue({
      response: { status: 401 },
      isAxiosError: true,
    })

    renderForm()
    await user.type(screen.getByLabelText('Email'), 'jean@email.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'mauvais')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email ou mot de passe incorrect.')
  })

  it('redirige vers / après connexion réussie', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'login').mockResolvedValue('fake-jwt-token')
    mockAuthLogin.mockResolvedValue(undefined)

    renderForm()
    await user.type(screen.getByLabelText('Email'), 'jean@email.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'Secure1234!')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

})
