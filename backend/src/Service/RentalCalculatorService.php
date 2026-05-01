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

    /**
     * Calcule le loyer mensuel LLD.
     *
     * basePrice = rentalPriceMonthly du véhicule (prix référence 36 mois / 10 000 km).
     */
    public function calculateMonthlyTotal(string $basePrice, int $duration, int $annualKm): string
    {
        $coefficient = self::DURATION_COEFFICIENTS[$duration];
        $surcharge   = self::KM_SURCHARGES[$annualKm];

        $monthly = (float) $basePrice * $coefficient + $surcharge;

        return number_format($monthly, 2, '.', '');
    }
}
