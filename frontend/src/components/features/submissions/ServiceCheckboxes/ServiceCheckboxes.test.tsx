import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ServiceCheckboxes from './ServiceCheckboxes'

describe('ServiceCheckboxes', () => {
  it('affiche les 4 services avec leur libellé et leur coût', () => {
    render(<ServiceCheckboxes selectedServices={[]} onChange={vi.fn()} />)

    expect(screen.getByText('Entretien & révisions')).toBeInTheDocument()
    expect(screen.getByText('Assurance tous risques')).toBeInTheDocument()
    expect(screen.getByText('Assistance 24h/24 — 7j/7')).toBeInTheDocument()
    expect(screen.getByText('Renouvellement pneumatiques')).toBeInTheDocument()

    expect(screen.getByText('+150 €/mois')).toBeInTheDocument()
    expect(screen.getByText('+80 €/mois')).toBeInTheDocument()
    expect(screen.getByText('+30 €/mois')).toBeInTheDocument()
    expect(screen.getByText('+25 €/mois')).toBeInTheDocument()
  })

  it('reflète les services déjà sélectionnés (checkbox cochée)', () => {
    render(<ServiceCheckboxes selectedServices={['MAINTENANCE']} onChange={vi.fn()} />)

    const maintenance = screen.getByRole('checkbox', { name: /Entretien & révisions/ })
    expect(maintenance).toBeChecked()
  })

  it('coche un service : onChange reçoit la clé ajoutée', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ServiceCheckboxes selectedServices={[]} onChange={onChange} />)

    await user.click(screen.getByRole('checkbox', { name: /Assurance tous risques/ }))

    expect(onChange).toHaveBeenCalledWith(['INSURANCE'])
  })

  it('décoche un service : onChange reçoit la liste sans cette clé', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ServiceCheckboxes selectedServices={['INSURANCE', 'TIRES']} onChange={onChange} />)

    await user.click(screen.getByRole('checkbox', { name: /Assurance tous risques/ }))

    expect(onChange).toHaveBeenCalledWith(['TIRES'])
  })
})
