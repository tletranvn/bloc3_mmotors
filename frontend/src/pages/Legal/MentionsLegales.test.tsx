import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MentionsLegales from './MentionsLegales'

describe('MentionsLegales', () => {
  it('affiche le titre et les sections clés', () => {
    render(<MentionsLegales />)

    expect(screen.getByRole('heading', { level: 1, name: /mentions légales/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /éditeur du site/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /hébergement/i })).toBeInTheDocument()
  })
})
