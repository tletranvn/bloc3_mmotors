<?php

namespace App\Tests\Unit\Service;

use App\Entity\Submission;
use App\Entity\Vehicle;
use App\Repository\SubmissionRepository;
use App\Service\VehicleService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class VehicleServiceTest extends TestCase
{
    private VehicleService $service;
    /** @var SubmissionRepository&MockObject */
    private SubmissionRepository $repo;

    protected function setUp(): void
    {
        $this->repo = $this->createMock(SubmissionRepository::class);
        $this->service = new VehicleService($this->repo);
    }

    private function makeVehicle(
        string $availability,
        ?string $salePrice = '20000',
        ?string $rentalPrice = '500',
    ): Vehicle {
        $vehicle = new Vehicle();
        $vehicle->setAvailabilityType($availability);
        $vehicle->setSalePrice($salePrice);
        $vehicle->setRentalPriceMonthly($rentalPrice);

        return $vehicle;
    }

    public function testToggleSaleToRental(): void
    {
        $vehicle = $this->makeVehicle(Vehicle::AVAILABILITY_SALE);
        $this->repo->method('hasActiveSubmissionForVehicle')->willReturn(false);
        $this->service->toggleAvailability($vehicle);

        $this->assertSame(Vehicle::AVAILABILITY_RENTAL, $vehicle->getAvailabilityType());
    }

    public function testToggleRentalToSale(): void
    {
        $vehicle = $this->makeVehicle(Vehicle::AVAILABILITY_RENTAL);
        $this->repo->method('hasActiveSubmissionForVehicle')->willReturn(false);
        $this->service->toggleAvailability($vehicle);

        $this->assertSame(Vehicle::AVAILABILITY_SALE, $vehicle->getAvailabilityType());
    }

    public function testToggleBothToRental(): void
    {
        $vehicle = $this->makeVehicle(Vehicle::AVAILABILITY_BOTH);
        $this->repo->method('hasActiveSubmissionForVehicle')->willReturn(false);
        $this->service->toggleAvailability($vehicle);

        $this->assertSame(Vehicle::AVAILABILITY_RENTAL, $vehicle->getAvailabilityType());
    }

    public function testToggleBlockedByPendingSubmission(): void
    {
        $vehicle = $this->makeVehicle(Vehicle::AVAILABILITY_SALE);
        $this->repo->method('hasActiveSubmissionForVehicle')->willReturn(true);

        $this->expectException(ConflictHttpException::class);
        $this->service->toggleAvailability($vehicle);
    }

    public function testToggleBlockedByApprovedSubmission(): void
    {
        $vehicle = $this->makeVehicle(Vehicle::AVAILABILITY_RENTAL);
        $this->repo->method('hasActiveSubmissionForVehicle')->willReturn(true);

        $this->expectException(ConflictHttpException::class);
        $this->service->toggleAvailability($vehicle);
    }

    public function testToggleBlockedByMissingRentalPrice(): void
    {
        $vehicle = $this->makeVehicle(Vehicle::AVAILABILITY_SALE, '20000', null);
        $this->repo->method('hasActiveSubmissionForVehicle')->willReturn(false);

        $this->expectException(UnprocessableEntityHttpException::class);
        $this->service->toggleAvailability($vehicle);
    }

    public function testToggleBlockedByMissingSalePrice(): void
    {
        $vehicle = $this->makeVehicle(Vehicle::AVAILABILITY_RENTAL, null, '500');
        $this->repo->method('hasActiveSubmissionForVehicle')->willReturn(false);

        $this->expectException(UnprocessableEntityHttpException::class);
        $this->service->toggleAvailability($vehicle);
    }
}
