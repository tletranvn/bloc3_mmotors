import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )

describe('Home', () => {
  it('affiche un titre principal (h1)', () => {
    renderHome()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it("affiche le CTA 'Découvrir nos véhicules'", () => {
    renderHome()
    expect(
      screen.getByRole('link', { name: /découvrir nos véhicules/i })
    ).toBeInTheDocument()
  })

  it('le CTA pointe vers /vehicles', () => {
    renderHome()
    expect(
      screen.getByRole('link', { name: /découvrir nos véhicules/i })
    ).toHaveAttribute('href', '/vehicles')
  })

  it('affiche un titre de section présentation M-Motors', () => {
    renderHome()
    // Exact match pour ne pas matcher "Pourquoi choisir M-Motors ?"
    expect(screen.getByRole('heading', { name: /^m-motors$/i })).toBeInTheDocument()
  })

  it('affiche les 4 cards avantages', () => {
    renderHome()
    // On cible les headings des cards (h3) pour éviter les faux positifs dans les descriptions
    expect(screen.getByRole('heading', { name: /^garantie qualité$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^service après-vente$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^financement$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^essai gratuit$/i })).toBeInTheDocument()
  })
})
