import { describe, it, expect } from 'vitest'
import { useRentalCalculator } from './useRentalCalculator'

// useRentalCalculator est une fonction pure (pas de hook React) : testable directement.
describe('useRentalCalculator', () => {
  it('retourne null sans prix de base', () => {
    expect(useRentalCalculator(null, 36, 10000)).toBeNull()
    expect(useRentalCalculator(undefined, 36, 10000)).toBeNull()
  })

  it('retourne null pour une durée ou un kilométrage invalide', () => {
    expect(useRentalCalculator('350', 12, 10000)).toBeNull()
    expect(useRentalCalculator('350', 36, 99999)).toBeNull()
  })

  it('calcule le cas de base (36 mois / 10 000 km)', () => {
    expect(useRentalCalculator('350', 36, 10000)).toBe('350.00')
  })

  it('applique coefficient durée et majoration kilométrage', () => {
    // 350 × 1.10 + 15 = 400
    expect(useRentalCalculator('350', 24, 15000)).toBe('400.00')
  })

  it('ajoute le coût des services sélectionnés', () => {
    // 350 + MAINTENANCE (150) + TIRES (25) = 525
    expect(useRentalCalculator('350', 36, 10000, ['MAINTENANCE', 'TIRES'])).toBe('525.00')
  })

  it('ignore une clé de service inconnue', () => {
    expect(useRentalCalculator('350', 36, 10000, ['HACKING'])).toBe('350.00')
  })
})
