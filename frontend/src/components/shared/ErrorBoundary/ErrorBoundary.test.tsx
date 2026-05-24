import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as Sentry from '@sentry/react'
import ErrorBoundary from './ErrorBoundary'

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
}))

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Boom')
  }
  return <p>Composant OK</p>
}

beforeEach(() => {
  vi.clearAllMocks()
  // Vitest fait remonter les erreurs des ErrorBoundary dans la console — on les masque
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('affiche les enfants quand il n\'y a pas d\'erreur', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Composant OK')).toBeInTheDocument()
  })

  it('affiche le fallback quand un enfant throw', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recharger la page' })).toBeInTheDocument()
  })

  it('notifie Sentry quand un enfant throw', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )

    expect(Sentry.captureException).toHaveBeenCalledTimes(1)
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Boom' }),
      expect.objectContaining({ extra: expect.any(Object) }),
    )
  })

  it('réessaye le rendu quand on clique sur "Réessayer"', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()

    // On corrige d'abord les enfants (plus de throw), puis on reset l'ErrorBoundary
    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))

    expect(screen.getByText('Composant OK')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
