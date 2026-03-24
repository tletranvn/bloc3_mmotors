import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'

describe('App', () => {
  it('affiche le titre Vite + React', () => {
    render(<App />)
    expect(screen.getByText('Vite + React')).toBeInTheDocument()
  })

  it('incremente le compteur au clic', async () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /count is 0/i })
    await userEvent.click(button)
    expect(screen.getByRole('button', { name: /count is 1/i })).toBeInTheDocument()
  })
})
