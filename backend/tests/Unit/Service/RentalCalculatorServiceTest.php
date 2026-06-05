<?php

namespace App\Tests\Unit\Service;

use App\Service\RentalCalculatorService;
use PHPUnit\Framework\TestCase;

class RentalCalculatorServiceTest extends TestCase
{
    private RentalCalculatorService $service;

    protected function setUp(): void
    {
        $this->service = new RentalCalculatorService();
    }

    public function testBaseCase36MonthsAnd10kKm(): void
    {
        // 36 mois (×1.00) + 10K km (+0€) = prix de base exact
        $result = $this->service->calculateMonthlyTotal('350', 36, 10000);
        $this->assertSame('350.00', $result);
    }

    public function testSurcharge24MonthsAnd15kKm(): void
    {
        // 24 mois (×1.10) + 15K km (+15€) → 350 × 1.10 + 15 = 385 + 15 = 400
        $result = $this->service->calculateMonthlyTotal('350', 24, 15000);
        $this->assertSame('400.00', $result);
    }

    public function testDiscount48MonthsAnd25kKm(): void
    {
        // 48 mois (×0.95) + 25K km (+50€) → 350 × 0.95 + 50 = 332.5 + 50 = 382.5
        $result = $this->service->calculateMonthlyTotal('350', 48, 25000);
        $this->assertSame('382.50', $result);
    }

    public function testSurcharge36MonthsAnd20kKm(): void
    {
        // 36 mois (×1.00) + 20K km (+30€) → 500 × 1.00 + 30 = 530
        $result = $this->service->calculateMonthlyTotal('500', 36, 20000);
        $this->assertSame('530.00', $result);
    }

    public function testDecimalBasePrice(): void
    {
        // Vérifie que les prix décimaux (stockés en string depuis Doctrine) sont gérés correctement
        $result = $this->service->calculateMonthlyTotal('299.90', 36, 10000);
        $this->assertSame('299.90', $result);
    }

    public function testNoServiceLeavesBaseUnchanged(): void
    {
        // 36 mois / 10K km, aucun service → prix de base
        $result = $this->service->calculateMonthlyTotal('350', 36, 10000, []);
        $this->assertSame('350.00', $result);
    }

    public function testSingleServiceAddsItsCost(): void
    {
        // 350 + MAINTENANCE (150) = 500
        $result = $this->service->calculateMonthlyTotal('350', 36, 10000, [RentalCalculatorService::SERVICE_MAINTENANCE]);
        $this->assertSame('500.00', $result);
    }

    public function testMultipleServicesAddAllCosts(): void
    {
        // 350 + MAINTENANCE (150) + TIRES (25) = 525
        $services = [RentalCalculatorService::SERVICE_MAINTENANCE, RentalCalculatorService::SERVICE_TIRES];
        $result   = $this->service->calculateMonthlyTotal('350', 36, 10000, $services);
        $this->assertSame('525.00', $result);
    }

    public function testServicesCombineWithDurationAndKm(): void
    {
        // 24 mois (×1.10) + 15K km (+15€) + INSURANCE (80) → 385 + 15 + 80 = 480
        $result = $this->service->calculateMonthlyTotal('350', 24, 15000, [RentalCalculatorService::SERVICE_INSURANCE]);
        $this->assertSame('480.00', $result);
    }

    public function testUnknownServiceIsIgnored(): void
    {
        // Une clé inconnue n'ajoute rien (validation faite en amont via Assert\Choice)
        $result = $this->service->calculateMonthlyTotal('350', 36, 10000, ['HACKING']);
        $this->assertSame('350.00', $result);
    }
}
