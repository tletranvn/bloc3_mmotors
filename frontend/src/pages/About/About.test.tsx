import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import About from './About'

describe('About', () => {
  it('affiche le titre et les liens vers le catalogue et le contact', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /à propos de m-motors/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /notre catalogue/i })).toHaveAttribute('href', '/vehicles')
    expect(screen.getByRole('link', { name: /contactez-nous/i })).toHaveAttribute('href', '/contact')
  })
})
