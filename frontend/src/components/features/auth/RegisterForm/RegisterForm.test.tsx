import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RegisterForm from './RegisterForm'
import * as authService from '../../../../services/api/authService'

// mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// mock authService
vi.mock('../../../../services/api/authService')

function renderForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  )
}

// Remplit tous les champs avec des valeurs valides
async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Prénom'), 'Jean')
  await user.type(screen.getByLabelText('Nom'), 'Dupont')
  await user.type(screen.getByLabelText('Email'), 'jean@email.com')
  await user.type(screen.getByLabelText('Téléphone'), '0612345678')
  await user.type(screen.getByLabelText('Mot de passe'), 'Secure1234!')
  await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'Secure1234!')
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RegisterForm', () => {

  it('affiche tous les champs du formulaire', () => {
    renderForm()
    expect(screen.getByLabelText('Prénom')).toBeInTheDocument()
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Téléphone')).toBeInTheDocument()
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmer le mot de passe')).toBeInTheDocument()
  })

  it('le bouton est désactivé si le formulaire est vide', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeDisabled()
  })

  it('affiche une erreur si le format email est invalide', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText('Email'), 'email-invalide')
    await user.tab()
    expect(screen.getByText('Format email invalide.')).toBeInTheDocument()
  })

  it('affiche une erreur si le mot de passe est trop faible', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText('Mot de passe'), 'faible')
    await user.tab()
    expect(screen.getByText(/minimum 8 caractères/i)).toBeInTheDocument()
  })

  it('affiche une erreur si les mots de passe ne correspondent pas', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText('Mot de passe'), 'Secure1234!')
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'Autre1234!')
    await user.tab()
    expect(screen.getByText('Les mots de passe ne correspondent pas.')).toBeInTheDocument()
  })

  it('affiche une erreur si le téléphone est invalide', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText('Téléphone'), '0123456789')
    await user.tab()
    expect(screen.getByText(/format invalide/i)).toBeInTheDocument()
  })

  it('affiche une erreur si email déjà utilisé (422)', async () => {
    const user = userEvent.setup()
    // isAxiosError: true suffit — axios.isAxiosError() vérifie cette propriété directement
    vi.spyOn(authService, 'register').mockRejectedValue({
      response: { status: 422 },
      isAxiosError: true,
    })

    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /s'inscrire/i }))

    expect(await screen.findByText('Cet email est déjà utilisé.')).toBeInTheDocument()
  })

  it('redirige vers /login après inscription réussie', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'register').mockResolvedValue({
      id: 1,
      email: 'jean@email.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '0612345678',
    })

    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /s'inscrire/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

})
