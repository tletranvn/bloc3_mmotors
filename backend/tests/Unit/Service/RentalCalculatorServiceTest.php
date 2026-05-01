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
}
