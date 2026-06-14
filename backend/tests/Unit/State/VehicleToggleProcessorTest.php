<?php

namespace App\Tests\Unit\State;

use ApiPlatform\Metadata\Patch;
use App\Entity\Vehicle;
use App\Service\VehicleService;
use App\State\VehicleToggleProcessor;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

class VehicleToggleProcessorTest extends TestCase
{
    public function testProcessTogglesAvailabilityFlushesAndReturnsVehicle(): void
    {
        $vehicle = new Vehicle();

        $vehicleService = $this->createMock(VehicleService::class);
        $vehicleService->expects($this->once())
            ->method('toggleAvailability')
            ->with($vehicle);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->once())->method('flush');

        $processor = new VehicleToggleProcessor($vehicleService, $entityManager);

        $result = $processor->process($vehicle, new Patch());

        $this->assertSame($vehicle, $result);
    }
}
