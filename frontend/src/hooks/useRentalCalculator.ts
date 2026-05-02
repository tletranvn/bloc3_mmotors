// Même formule que RentalCalculatorService.php — doit rester synchronisée avec le backend.
const DURATION_COEFFICIENTS: Record<number, number> = {
  24: 1.10,
  36: 1.00,
  48: 0.95,
}

const KM_SURCHARGES: Record<number, number> = {
  10000: 0,
  15000: 15,
  20000: 30,
  25000: 50,
}

export function useRentalCalculator(basePrice: string | null | undefined, duration: number, annualKm: number): string | null {
  if (!basePrice) return null

  const coefficient = DURATION_COEFFICIENTS[duration]
  const surcharge = KM_SURCHARGES[annualKm]

  if (coefficient === undefined || surcharge === undefined) return null

  const monthly = parseFloat(basePrice) * coefficient + surcharge
  return monthly.toFixed(2)
}
