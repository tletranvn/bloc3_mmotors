import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('affiche la homepage avec un titre principal', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('affiche la navigation principale', () => {
    render(<App />)
    expect(screen.getByRole('navigation', { name: /principale/i })).toBeInTheDocument()
  })
})
