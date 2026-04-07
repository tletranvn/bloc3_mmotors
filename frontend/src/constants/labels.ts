export const FUEL_TYPE_LABELS: Record<string, string> = {
  GASOLINE: 'Essence',
  DIESEL: 'Diesel',
  HYBRID: 'Hybride',
  ELECTRIC: 'Électrique',
};

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponible',
  RESERVED: 'Réservé',
  SOLD: 'Vendu',
  ON_LEASE: 'En location',
  MAINTENANCE: 'En maintenance',
};

export const AVAILABILITY_TYPE_LABELS: Record<string, string> = {
  SALE: 'Vente',
  RENTAL: 'Location',
  BOTH: 'Vente & Location',
};

export const AVAILABILITY_TYPE_BADGE_CLASSES: Record<string, string> = {
  SALE: 'bg-blue-100 text-blue-800',
  RENTAL: 'bg-green-100 text-green-800',
  BOTH: 'bg-purple-100 text-purple-800',
};

export const RENTAL_SERVICES: string[] = [
  'Assurance tous risques',
  'Assistance 24h/24',
  'Entretien & révisions',
  'Contrôle technique',
];
