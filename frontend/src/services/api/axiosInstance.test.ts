import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { AxiosError } from 'axios'
import * as Sentry from '@sentry/react'
import { handleApiError } from './axiosInstance'

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
}))

function makeError(status: number | undefined): AxiosError {
  return {
    response: status === undefined ? undefined : { status, data: {}, statusText: '', headers: {}, config: {} },
    isAxiosError: true,
    toJSON: () => ({}),
    name: 'AxiosError',
    message: 'Erreur simulée',
    config: {},
  } as unknown as AxiosError
}

const originalLocation = window.location

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.setItem('token', 'fake-jwt')
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { pathname: '/dashboard', href: '' },
  })
})

afterEach(() => {
  Object.defineProperty(window, 'location', { writable: true, value: originalLocation })
  localStorage.clear()
})

describe('handleApiError', () => {
  it('rejette toujours la promesse pour que le code appelant voie l\'erreur', async () => {
    const error = makeError(422)
    await expect(handleApiError(error)).rejects.toBe(error)
  })

  it('sur 401 : supprime le token et redirige vers /login', async () => {
    const error = makeError(401)
    await expect(handleApiError(error)).rejects.toBe(error)

    expect(localStorage.getItem('token')).toBeNull()
    expect(window.location.href).toBe('/login')
  })

  it('sur 401 : ne redirige pas si on est déjà sur /login', async () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { pathname: '/login', href: '' },
    })

    const error = makeError(401)
    await expect(handleApiError(error)).rejects.toBe(error)

    expect(localStorage.getItem('token')).toBeNull()
    expect(window.location.href).toBe('')
  })

  it('sur 500 : notifie Sentry', async () => {
    const error = makeError(500)
    await expect(handleApiError(error)).rejects.toBe(error)

    expect(Sentry.captureException).toHaveBeenCalledTimes(1)
    expect(Sentry.captureException).toHaveBeenCalledWith(error)
  })

  it('sur 503 : notifie Sentry', async () => {
    const error = makeError(503)
    await expect(handleApiError(error)).rejects.toBe(error)

    expect(Sentry.captureException).toHaveBeenCalledTimes(1)
  })

  it('sur 422 : ne touche pas au localStorage et ne notifie pas Sentry', async () => {
    const error = makeError(422)
    await expect(handleApiError(error)).rejects.toBe(error)

    expect(localStorage.getItem('token')).toBe('fake-jwt')
    expect(Sentry.captureException).not.toHaveBeenCalled()
  })

  it('sans réponse (erreur réseau) : ne fait rien de spécial', async () => {
    const error = makeError(undefined)
    await expect(handleApiError(error)).rejects.toBe(error)

    expect(localStorage.getItem('token')).toBe('fake-jwt')
    expect(Sentry.captureException).not.toHaveBeenCalled()
  })
})
