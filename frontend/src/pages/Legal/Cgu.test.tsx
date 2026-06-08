import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Cgu from './Cgu'

describe('Cgu', () => {
  it('affiche le titre et la section objet', () => {
    render(<Cgu />)

    expect(screen.getByRole('heading', { level: 1, name: /conditions générales d'utilisation/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /1\. objet/i })).toBeInTheDocument()
  })
})
