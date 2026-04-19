import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProtectedRoute from './ProtectedRoute'
import * as useAuthModule from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth')

function mockUseAuth(isAuthenticated: boolean) {
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    isAuthenticated,
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
}

function renderProtectedRoute(isAuthenticated: boolean) {
  mockUseAuth(isAuthenticated)
  return render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route
          path="/secret"
          element={
            <ProtectedRoute>
              <p>Contenu protégé</p>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<p>Page de login</p>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProtectedRoute', () => {

  it('redirige vers /login si non connecté', () => {
    renderProtectedRoute(false)
    expect(screen.getByText('Page de login')).toBeInTheDocument()
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument()
  })

  it('affiche le contenu si connecté', () => {
    renderProtectedRoute(true)
    expect(screen.getByText('Contenu protégé')).toBeInTheDocument()
    expect(screen.queryByText('Page de login')).not.toBeInTheDocument()
  })

})
