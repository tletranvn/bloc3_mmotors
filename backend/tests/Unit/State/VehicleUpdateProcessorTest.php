<?php

namespace App\Tests\Unit\State;

use ApiPlatform\Metadata\Put;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Vehicle;
use App\Repository\SubmissionRepository;
use App\State\VehicleUpdateProcessor;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class VehicleUpdateProcessorTest extends TestCase
{
    public function testThrowsConflictWhenVehicleHasActiveSubmissions(): void
    {
        $repository = $this->createMock(SubmissionRepository::class);
        $repository->method('hasActiveSubmissionForVehicleId')->with(5)->willReturn(true);

        $inner = $this->createMock(ProcessorInterface::class);
        $inner->expects($this->never())->method('process');

        $processor = new VehicleUpdateProcessor($inner, $repository);

        $this->expectException(ConflictHttpException::class);

        $processor->process(new Vehicle(), new Put(), ['id' => 5]);
    }

    public function testDelegatesWhenNoActiveSubmissions(): void
    {
        $vehicle = new Vehicle();

        $repository = $this->createMock(SubmissionRepository::class);
        $repository->method('hasActiveSubmissionForVehicleId')->willReturn(false);

        $inner = $this->createMock(ProcessorInterface::class);
        $inner->expects($this->once())->method('process')->willReturn($vehicle);

        $processor = new VehicleUpdateProcessor($inner, $repository);

        $result = $processor->process($vehicle, new Put(), ['id' => 5]);

        $this->assertSame($vehicle, $result);
    }

    public function testDelegatesNonVehicleDataWithoutCheckingSubmissions(): void
    {
        $other = new \stdClass();

        $repository = $this->createMock(SubmissionRepository::class);
        $repository->expects($this->never())->method('hasActiveSubmissionForVehicleId');

        $inner = $this->createMock(ProcessorInterface::class);
        $inner->expects($this->once())->method('process')->with($other)->willReturn($other);

        $processor = new VehicleUpdateProcessor($inner, $repository);

        $this->assertSame($other, $processor->process($other, new Put()));
    }
}
