import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import * as useAuthModule from './hooks/useAuth'

vi.mock('./hooks/useAuth')

beforeEach(() => {
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    isAuthenticated: false,
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
})

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
