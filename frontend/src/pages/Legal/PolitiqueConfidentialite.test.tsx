import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PolitiqueConfidentialite from './PolitiqueConfidentialite'

describe('PolitiqueConfidentialite', () => {
  it('affiche le titre et la section sur les droits RGPD', () => {
    render(<PolitiqueConfidentialite />)

    expect(screen.getByRole('heading', { level: 1, name: /politique de confidentialité/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /vos droits/i })).toBeInTheDocument()
  })
})
