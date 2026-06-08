import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Contact from './Contact'

describe('Contact', () => {
  it('affiche le titre et un lien email cliquable', () => {
    render(<Contact />)

    expect(screen.getByRole('heading', { level: 1, name: /contact/i })).toBeInTheDocument()

    const emailLink = screen.getByRole('link', { name: /contact@m-motors\.fr/i })
    expect(emailLink).toHaveAttribute('href', 'mailto:contact@m-motors.fr')
  })
})
