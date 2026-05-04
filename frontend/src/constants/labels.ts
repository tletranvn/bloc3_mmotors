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

export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  PENDING:  'En attente',
  APPROVED: 'Validé',
  REJECTED: 'Refusé',
};

export const SUBMISSION_STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING:  'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  SALE:   'Achat',
  RENTAL: 'Location',
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  IDENTITY: "Pièce d'identité",
  ADDRESS:  'Justificatif de domicile',
  RIB:      'RIB',
  PAYSLIP:  'Bulletin de salaire',
};

export const RENTAL_SERVICES: string[] = [
  'Assurance tous risques',
  'Assistance 24h/24',
  'Entretien & révisions',
  'Contrôle technique',
];

export const SALE_GUARANTEES: string[] = [
  'Garantie constructeur 12 mois minimum',
  'Contrôle technique à jour',
  'Historique d\'entretien vérifié',
  'Véhicule révisé avant livraison',
  '14 jours satisfait ou remboursé',
];

