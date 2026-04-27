import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Profile from './Profile'
import * as useAuthModule from '../../hooks/useAuth'
import * as authService from '../../services/api/authService'

vi.mock('../../hooks/useAuth')
vi.mock('../../services/api/authService')

const mockUser = {
  id: 1,
  email: 'jean@email.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  phone: '0612345678',
  address: '10 rue de Paris',
  roles: ['ROLE_USER'],
}

const mockUpdateUser = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    user: mockUser,
    token: 'fake-token',
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: mockUpdateUser,
  })
})

const renderProfile = () =>
  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  )

describe('Profile', () => {

  it('affiche le champ email pré-rempli en lecture seule', () => {
    renderProfile()
    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toHaveValue('jean@email.com')
    expect(emailInput).toHaveAttribute('readonly')
  })

  it('affiche les champs pré-remplis avec les données du user', () => {
    renderProfile()
    expect(screen.getByLabelText('Prénom')).toHaveValue('Jean')
    expect(screen.getByLabelText('Nom')).toHaveValue('Dupont')
    expect(screen.getByLabelText('Téléphone')).toHaveValue('0612345678')
    expect(screen.getByLabelText('Adresse')).toHaveValue('10 rue de Paris')
  })

  it('affiche un message de succès après une mise à jour réussie', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'updateProfile').mockResolvedValue({ ...mockUser, firstName: 'Jean' })

    renderProfile()
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/profil mis à jour/i)
    })
    expect(mockUpdateUser).toHaveBeenCalledOnce()
  })

  it('envoie les champs modifiés et supprime l’adresse vide du payload', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'updateProfile').mockResolvedValue({
      ...mockUser,
      firstName: 'Jeanne',
      lastName: 'Martin',
      phone: '0711223344',
      address: undefined,
    })

    renderProfile()

    await user.clear(screen.getByLabelText('Prénom'))
    await user.type(screen.getByLabelText('Prénom'), 'Jeanne')
    await user.clear(screen.getByLabelText('Nom'))
    await user.type(screen.getByLabelText('Nom'), 'Martin')
    await user.clear(screen.getByLabelText('Téléphone'))
    await user.type(screen.getByLabelText('Téléphone'), '0711223344')
    await user.clear(screen.getByLabelText('Adresse'))
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith(
        1,
        {
          firstName: 'Jeanne',
          lastName: 'Martin',
          phone: '0711223344',
          address: undefined,
        },
        'fake-token',
      )
    })
  })

  it('désactive le bouton et affiche le libellé de chargement pendant la sauvegarde', async () => {
    const user = userEvent.setup()
    let resolveRequest: ((value: typeof mockUser) => void) | undefined

    vi.spyOn(authService, 'updateProfile').mockImplementation(
      () => new Promise((resolve) => {
        resolveRequest = resolve
      })
    )

    renderProfile()

    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    expect(screen.getByRole('button', { name: /enregistrement/i })).toBeDisabled()

    resolveRequest?.(mockUser)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enregistrer/i })).toBeEnabled()
    })
  })

  it('affiche un message d\'erreur après un échec 422', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'updateProfile').mockRejectedValue({
      isAxiosError: true,
      response: { status: 422 },
    })

    renderProfile()
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/format du téléphone/i)
    })
  })

  it('affiche un message d\'erreur générique sur erreur inconnue', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'updateProfile').mockRejectedValue(new Error('network'))

    renderProfile()
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/une erreur est survenue/i)
    })
  })

  it('affiche le lien "Retour à Mon espace" qui pointe vers /dashboard', () => {
    renderProfile()
    const link = screen.getByRole('link', { name: /retour à mon espace/i })
    expect(link).toHaveAttribute('href', '/dashboard')
  })

})
