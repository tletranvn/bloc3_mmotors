import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Dashboard from './Dashboard'
import * as useAuthModule from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth')

const mockUser = {
  id: 1,
  email: 'jean@email.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  phone: '0612345678',
  roles: ['ROLE_USER'],
}

beforeEach(() => {
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    user: mockUser,
    token: 'fake-token',
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  })
})

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  )

describe('Dashboard', () => {

  it('affiche le prénom et le nom de l\'utilisateur', () => {
    renderDashboard()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jean Dupont')
  })

  it('affiche l\'email de l\'utilisateur', () => {
    renderDashboard()
    expect(screen.getByText('jean@email.com')).toBeInTheDocument()
  })

  it('affiche les 3 cartes de stats', () => {
    renderDashboard()
    expect(screen.getByText('En attente')).toBeInTheDocument()
    expect(screen.getByText('Validés')).toBeInTheDocument()
    expect(screen.getByText('Refusés')).toBeInTheDocument()
  })

  it('affiche le message "pas encore de dossier" quand tout est à 0', () => {
    renderDashboard()
    expect(screen.getByText(/vous n'avez pas encore de dossier/i)).toBeInTheDocument()
  })

  it('affiche le lien "Chercher un véhicule"', () => {
    renderDashboard()
    const link = screen.getByRole('link', { name: /chercher un véhicule/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/vehicles')
  })

  it('affiche le lien "Mon profil"', () => {
    renderDashboard()
    const link = screen.getByRole('link', { name: /mon profil/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/profile')
  })

})
