// Miroir frontend de RentalCalculatorService.php (constantes SERVICE_*).
// Les clés sont en anglais (stockées en base), les libellés en français (affichage).
// SERVICE_PRICING doit rester synchronisé avec SERVICES_PRICING côté backend.

export const SERVICE_KEYS = ['MAINTENANCE', 'INSURANCE', 'ASSISTANCE', 'TIRES'] as const

export type ServiceKey = (typeof SERVICE_KEYS)[number]

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  MAINTENANCE: 'Entretien & révisions',
  INSURANCE: 'Assurance tous risques',
  ASSISTANCE: 'Assistance 24h/24 — 7j/7',
  TIRES: 'Renouvellement pneumatiques',
}

export const SERVICE_PRICING: Record<ServiceKey, number> = {
  MAINTENANCE: 150,
  INSURANCE: 80,
  ASSISTANCE: 30,
  TIRES: 25,
}
