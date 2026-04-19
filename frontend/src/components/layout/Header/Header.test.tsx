import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Header from './Header'
import * as useAuthModule from '../../../hooks/useAuth'

vi.mock('../../../hooks/useAuth')

beforeEach(() => {
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    isAuthenticated: false,
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
})

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  )

describe('Header', () => {
  it('affiche le logo M-MOTORS', () => {
    renderHeader()
    expect(screen.getByText('M-MOTORS')).toBeInTheDocument()
  })

  it('affiche la navigation principale avec les 4 liens', () => {
    renderHeader()
    const nav = screen.getByRole('navigation', { name: /principale/i })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /accueil/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /catalogue/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /à propos/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
  })

  it('affiche les boutons connexion et inscription', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: /se connecter/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /s'inscrire/i })).toBeInTheDocument()
  })

  it('ouvre le menu mobile au clic sur le burger', async () => {
    renderHeader()
    const burger = screen.getByRole('button', { name: /ouvrir le menu/i })
    await userEvent.click(burger)
    expect(screen.getByRole('navigation', { name: /mobile/i })).toBeInTheDocument()
  })

  it('ferme le menu mobile au clic sur un lien', async () => {
    renderHeader()
    const burger = screen.getByRole('button', { name: /ouvrir le menu/i })
    await userEvent.click(burger)

    const mobileNav = screen.getByRole('navigation', { name: /mobile/i })
    const accueilLink = mobileNav.querySelector('a[href="/"]')
    expect(accueilLink).toBeInTheDocument()
    await userEvent.click(accueilLink as Element)

    expect(screen.queryByRole('navigation', { name: /mobile/i })).not.toBeInTheDocument()
  })

  it('change le label du burger quand le menu est ouvert', async () => {
    renderHeader()
    const burger = screen.getByRole('button', { name: /ouvrir le menu/i })
    await userEvent.click(burger)
    expect(screen.getByRole('button', { name: /fermer le menu/i })).toBeInTheDocument()
  })
})
