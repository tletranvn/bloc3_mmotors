import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import VehicleForm from './VehicleForm'
import * as vehicleService from '../../../../services/api/vehicleService'
import type { Vehicle } from '../../../../services/api/vehicleService'

vi.mock('../../../../hooks/useAuth', () => ({
  useAuth: () => ({ token: 'fake-token' }),
}))

vi.mock('../ImageUploader/ImageUploader', () => ({
  default: ({ onUpload }: { onUpload: (url: string) => void }) => (
    <button type="button" onClick={() => onUpload('https://example.com/car.jpg')}>
      Mock Upload Image
    </button>
  ),
}))

vi.mock('../../../../services/api/vehicleService', async (importOriginal) => {
  const actual = await importOriginal<typeof vehicleService>()
  return {
    ...actual,
    createVehicle: vi.fn().mockResolvedValue({ id: 99 }),
    updateVehicle: vi.fn().mockResolvedValue({ id: 1 }),
  }
})

const mockVehicle: Vehicle = {
  '@id': '/api/vehicles/1',
  '@type': 'Vehicle',
  id: 1,
  brand: 'Renault',
  model: 'Clio',
  year: 2022,
  mileage: 15000,
  fuelType: 'DIESEL',
  color: 'Blanc',
  salePrice: '12000.00',
  rentalPriceMonthly: null,
  availabilityType: 'SALE',
  status: 'AVAILABLE',
  description: 'Belle voiture',
  createdAt: '2026-01-01T00:00:00Z',
  imageUrl: null,
}

const defaultProps = {
  onSuccess: vi.fn(),
  onCancel: vi.fn(),
}

describe('VehicleForm — mode création', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre "Ajouter un véhicule"', () => {
    render(<VehicleForm {...defaultProps} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Ajouter un véhicule')
  })

  it('affiche le bouton "Ajouter le véhicule"', () => {
    render(<VehicleForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: /ajouter le véhicule/i })).toBeInTheDocument()
  })

  it('affiche salePrice par défaut (availabilityType = SALE)', () => {
    render(<VehicleForm {...defaultProps} />)
    expect(screen.getByText(/prix de vente/i)).toBeInTheDocument()
    expect(screen.queryByText(/loyer de référence/i)).not.toBeInTheDocument()
  })

  it('affiche rentalPriceMonthly et masque salePrice quand RENTAL sélectionné', () => {
    render(<VehicleForm {...defaultProps} />)
    fireEvent.change(screen.getByDisplayValue('Vente'), { target: { value: 'RENTAL' } })
    expect(screen.queryByText(/prix de vente/i)).not.toBeInTheDocument()
    expect(screen.getByText(/loyer de référence/i)).toBeInTheDocument()
  })

  it('affiche les deux prix quand BOTH sélectionné', () => {
    render(<VehicleForm {...defaultProps} />)
    fireEvent.change(screen.getByDisplayValue('Vente'), { target: { value: 'BOTH' } })
    expect(screen.getByText(/prix de vente/i)).toBeInTheDocument()
    expect(screen.getByText(/loyer de référence/i)).toBeInTheDocument()
  })

  it('appelle onCancel quand on clique Annuler', () => {
    render(<VehicleForm {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }))
    expect(defaultProps.onCancel).toHaveBeenCalledOnce()
  })

  it('met à jour les champs texte : brand, model, color', () => {
    render(<VehicleForm {...defaultProps} />)
    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'Toyota' } })
    fireEvent.change(textboxes[1], { target: { value: 'Yaris' } })
    fireEvent.change(textboxes[2], { target: { value: 'Noir' } })
    expect(screen.getByDisplayValue('Toyota')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Yaris')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Noir')).toBeInTheDocument()
  })

  it('met à jour les champs numériques : year, mileage, salePrice', () => {
    render(<VehicleForm {...defaultProps} />)
    const spinbuttons = screen.getAllByRole('spinbutton')
    fireEvent.change(spinbuttons[0], { target: { value: '2023' } })
    fireEvent.change(spinbuttons[1], { target: { value: '5000' } })
    fireEvent.change(spinbuttons[2], { target: { value: '15000' } })
    expect(screen.getByDisplayValue('2023')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('15000')).toBeInTheDocument()
  })

  it('met à jour le statut et déclenche onUpload via ImageUploader', () => {
    render(<VehicleForm {...defaultProps} />)
    fireEvent.change(screen.getByDisplayValue('Disponible'), { target: { value: 'RESERVED' } })
    expect(screen.getByDisplayValue('Réservé')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /mock upload image/i }))
  })

  it('met à jour le loyer mensuel après passage en RENTAL', () => {
    render(<VehicleForm {...defaultProps} />)
    fireEvent.change(screen.getByDisplayValue('Vente'), { target: { value: 'RENTAL' } })
    const spinbuttons = screen.getAllByRole('spinbutton')
    fireEvent.change(spinbuttons[spinbuttons.length - 1], { target: { value: '350' } })
    expect(screen.getByDisplayValue('350')).toBeInTheDocument()
  })

  it('affiche une erreur si la soumission échoue', async () => {
    vi.mocked(vehicleService.createVehicle).mockRejectedValue(new Error('network'))
    render(<VehicleForm {...defaultProps} />)
    fireEvent.submit(document.querySelector('form')!)
    await screen.findByText(/une erreur est survenue/i)
  })

  it('appelle createVehicle à la soumission du formulaire', async () => {
    render(<VehicleForm {...defaultProps} />)
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(vehicleService.createVehicle).toHaveBeenCalledWith('fake-token', expect.any(Object))
    })
  })

})

describe('VehicleForm — mode édition', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre avec la marque et le modèle du véhicule', () => {
    render(<VehicleForm {...defaultProps} vehicle={mockVehicle} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Renault Clio')
  })

  it('affiche le bouton "Enregistrer les modifications"', () => {
    render(<VehicleForm {...defaultProps} vehicle={mockVehicle} />)
    expect(screen.getByRole('button', { name: /enregistrer les modifications/i })).toBeInTheDocument()
  })

  it('pré-remplit les champs avec les données du véhicule', () => {
    render(<VehicleForm {...defaultProps} vehicle={mockVehicle} />)
    expect(screen.getByDisplayValue('Renault')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Clio')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2022')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Belle voiture')).toBeInTheDocument()
  })

  it('pré-sélectionne le bon carburant', () => {
    render(<VehicleForm {...defaultProps} vehicle={mockVehicle} />)
    expect(screen.getByDisplayValue('Diesel')).toBeInTheDocument()
  })

  it('appelle updateVehicle (pas createVehicle) à la soumission', async () => {
    render(<VehicleForm {...defaultProps} vehicle={mockVehicle} />)
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(vehicleService.updateVehicle).toHaveBeenCalledWith('fake-token', 1, expect.any(Object))
      expect(vehicleService.createVehicle).not.toHaveBeenCalled()
    })
  })

})
