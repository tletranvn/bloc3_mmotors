<?php

namespace App\Service;

class RentalCalculatorService
{
    // Coefficients durée appliqués au prix de base (référence : 36 mois = 1.00)
    private const DURATION_COEFFICIENTS = [
        24 => 1.10,
        36 => 1.00,
        48 => 0.95,
    ];

    // Majorations kilométrage en €/mois (référence : 10 000 km = 0 €)
    private const KM_SURCHARGES = [
        10000 => 0,
        15000 => 15,
        20000 => 30,
        25000 => 50,
    ];

    public const VALID_DURATIONS = [24, 36, 48];
    public const VALID_ANNUAL_KM = [10000, 15000, 20000, 25000];

    public const SERVICE_MAINTENANCE = 'MAINTENANCE';
    public const SERVICE_INSURANCE   = 'INSURANCE';
    public const SERVICE_ASSISTANCE  = 'ASSISTANCE';
    public const SERVICE_TIRES       = 'TIRES';

    // Coût mensuel en € de chaque service optionnel LLD.
    // Doit rester synchronisé avec SERVICE_PRICING côté frontend.
    public const SERVICES_PRICING = [
        self::SERVICE_MAINTENANCE => 150,
        self::SERVICE_INSURANCE   => 80,
        self::SERVICE_ASSISTANCE  => 30,
        self::SERVICE_TIRES       => 25,
    ];

    // Clés valides, utilisées par la contrainte Assert\Choice sur Submission::$services.
    public const SERVICE_KEYS = [
        self::SERVICE_MAINTENANCE,
        self::SERVICE_INSURANCE,
        self::SERVICE_ASSISTANCE,
        self::SERVICE_TIRES,
    ];

    /**
     * Calcule le loyer mensuel LLD.
     *
     * basePrice = rentalPriceMonthly du véhicule (prix référence 36 mois / 10 000 km).
     * $services = clés des services optionnels sélectionnés (voir SERVICE_KEYS).
     */
    public function calculateMonthlyTotal(string $basePrice, int $duration, int $annualKm, array $services = []): string
    {
        $coefficient = self::DURATION_COEFFICIENTS[$duration];
        $surcharge   = self::KM_SURCHARGES[$annualKm];

        $monthly = (float) $basePrice * $coefficient + $surcharge;

        foreach ($services as $service) {
            // Service inconnu ignoré : la validation se fait en amont via Assert\Choice.
            $monthly += self::SERVICES_PRICING[$service] ?? 0;
        }

        return number_format($monthly, 2, '.', '');
    }
}
