<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Submission;
use App\Entity\Vehicle;
use PHPUnit\Framework\TestCase;

class VehicleTest extends TestCase
{
    private Vehicle $vehicle;

    protected function setUp(): void
    {
        $this->vehicle = new Vehicle();
    }

    public function testConstructorInitializesDefaults(): void
    {
        $this->assertSame(Vehicle::STATUS_AVAILABLE, $this->vehicle->getStatus());
        $this->assertInstanceOf(\DateTimeInterface::class, $this->vehicle->getCreatedAt());
        $this->assertNull($this->vehicle->getId());
    }

    public function testSetGetBrand(): void
    {
        $this->vehicle->setBrand('Renault');
        $this->assertSame('Renault', $this->vehicle->getBrand());
    }

    public function testSetGetModel(): void
    {
        $this->vehicle->setModel('Clio');
        $this->assertSame('Clio', $this->vehicle->getModel());
    }

    public function testSetGetYear(): void
    {
        $this->vehicle->setYear(2023);
        $this->assertSame(2023, $this->vehicle->getYear());
    }

    public function testSetGetMileage(): void
    {
        $this->vehicle->setMileage(45000);
        $this->assertSame(45000, $this->vehicle->getMileage());
    }

    public function testSetGetFuelType(): void
    {
        $this->vehicle->setFuelType(Vehicle::FUEL_DIESEL);
        $this->assertSame(Vehicle::FUEL_DIESEL, $this->vehicle->getFuelType());
    }

    public function testGetFuelTypeLabel(): void
    {
        $this->vehicle->setFuelType(Vehicle::FUEL_GASOLINE);
        $this->assertSame('Essence', $this->vehicle->getFuelTypeLabel());

        $this->vehicle->setFuelType(Vehicle::FUEL_DIESEL);
        $this->assertSame('Diesel', $this->vehicle->getFuelTypeLabel());

        $this->vehicle->setFuelType(Vehicle::FUEL_HYBRID);
        $this->assertSame('Hybride', $this->vehicle->getFuelTypeLabel());

        $this->vehicle->setFuelType(Vehicle::FUEL_ELECTRIC);
        $this->assertSame('Électrique', $this->vehicle->getFuelTypeLabel());
    }

    public function testGetFuelTypeLabelUnknownReturnsRawValue(): void
    {
        $this->vehicle->setFuelType('HYDROGEN');
        $this->assertSame('HYDROGEN', $this->vehicle->getFuelTypeLabel());
    }

    public function testSetGetColor(): void
    {
        $this->vehicle->setColor('Rouge');
        $this->assertSame('Rouge', $this->vehicle->getColor());
    }

    public function testColorNullable(): void
    {
        $this->vehicle->setColor(null);
        $this->assertNull($this->vehicle->getColor());
    }

    public function testSetGetSalePrice(): void
    {
        $this->vehicle->setSalePrice('25000.00');
        $this->assertSame('25000.00', $this->vehicle->getSalePrice());
    }

    public function testSalePriceNullable(): void
    {
        $this->vehicle->setSalePrice(null);
        $this->assertNull($this->vehicle->getSalePrice());
    }

    public function testSetGetRentalPriceMonthly(): void
    {
        $this->vehicle->setRentalPriceMonthly('350.00');
        $this->assertSame('350.00', $this->vehicle->getRentalPriceMonthly());
    }

    public function testRentalPriceMonthlyNullable(): void
    {
        $this->vehicle->setRentalPriceMonthly(null);
        $this->assertNull($this->vehicle->getRentalPriceMonthly());
    }

    public function testSetGetAvailabilityType(): void
    {
        $this->vehicle->setAvailabilityType(Vehicle::AVAILABILITY_BOTH);
        $this->assertSame(Vehicle::AVAILABILITY_BOTH, $this->vehicle->getAvailabilityType());
    }

    public function testSetGetStatus(): void
    {
        $this->vehicle->setStatus(Vehicle::STATUS_SOLD);
        $this->assertSame(Vehicle::STATUS_SOLD, $this->vehicle->getStatus());
    }

    public function testSetGetDescription(): void
    {
        $this->vehicle->setDescription('Belle voiture');
        $this->assertSame('Belle voiture', $this->vehicle->getDescription());
    }

    public function testDescriptionNullable(): void
    {
        $this->vehicle->setDescription(null);
        $this->assertNull($this->vehicle->getDescription());
    }

    public function testSetGetImageUrl(): void
    {
        $this->vehicle->setImageUrl('https://example.com/image.jpg');
        $this->assertSame('https://example.com/image.jpg', $this->vehicle->getImageUrl());
    }

    public function testImageUrlNullable(): void
    {
        $this->vehicle->setImageUrl(null);
        $this->assertNull($this->vehicle->getImageUrl());
    }

    public function testIsDeletedFalseByDefault(): void
    {
        $this->assertFalse($this->vehicle->isDeleted());
    }

    public function testIsDeletedTrueWhenDeletedAtSet(): void
    {
        $this->vehicle->setDeletedAt(new \DateTime());
        $this->assertTrue($this->vehicle->isDeleted());
    }

    public function testSetGetDeletedAt(): void
    {
        $date = new \DateTime();
        $this->vehicle->setDeletedAt($date);
        $this->assertSame($date, $this->vehicle->getDeletedAt());
    }

    public function testDeletedAtNullable(): void
    {
        $this->vehicle->setDeletedAt(null);
        $this->assertNull($this->vehicle->getDeletedAt());
    }

    public function testSetGetCreatedAt(): void
    {
        $date = new \DateTime('2025-01-01');
        $this->vehicle->setCreatedAt($date);
        $this->assertSame($date, $this->vehicle->getCreatedAt());
    }

    public function testSetGetUpdatedAt(): void
    {
        $date = new \DateTime();
        $this->vehicle->setUpdatedAt($date);
        $this->assertSame($date, $this->vehicle->getUpdatedAt());
    }

    public function testUpdatedAtNullable(): void
    {
        $this->vehicle->setUpdatedAt(null);
        $this->assertNull($this->vehicle->getUpdatedAt());
    }

    public function testGetSubmissionsEmptyByDefault(): void
    {
        $this->assertCount(0, $this->vehicle->getSubmissions());
    }

    public function testAddSubmission(): void
    {
        $submission = new Submission();
        $this->vehicle->addSubmission($submission);
        $this->assertCount(1, $this->vehicle->getSubmissions());
        $this->assertSame($this->vehicle, $submission->getVehicle());
    }

    public function testAddSubmissionNoDuplicate(): void
    {
        $submission = new Submission();
        $this->vehicle->addSubmission($submission);
        $this->vehicle->addSubmission($submission);
        $this->assertCount(1, $this->vehicle->getSubmissions());
    }

    public function testRemoveSubmission(): void
    {
        $submission = new Submission();
        $this->vehicle->addSubmission($submission);
        $this->vehicle->removeSubmission($submission);
        $this->assertCount(0, $this->vehicle->getSubmissions());
        $this->assertNull($submission->getVehicle());
    }
}
