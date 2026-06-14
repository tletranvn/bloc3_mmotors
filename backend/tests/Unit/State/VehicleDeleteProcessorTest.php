<?php

namespace App\Tests\Unit\State;

use ApiPlatform\Metadata\Delete;
use App\Entity\Submission;
use App\Entity\Vehicle;
use App\Repository\SubmissionRepository;
use App\State\VehicleDeleteProcessor;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class VehicleDeleteProcessorTest extends TestCase
{
    public function testReturnsNullForNonVehicleData(): void
    {
        $processor = new VehicleDeleteProcessor(
            $this->createMock(EntityManagerInterface::class),
            $this->createMock(SubmissionRepository::class),
            $this->createMock(LoggerInterface::class),
        );

        $this->assertNull($processor->process(new \stdClass(), new Delete()));
    }

    public function testThrowsConflictWhenVehicleHasActiveSubmissions(): void
    {
        $repository = $this->createMock(SubmissionRepository::class);
        $repository->method('findBy')->willReturn([new Submission()]);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->never())->method('flush');

        $processor = new VehicleDeleteProcessor(
            $entityManager,
            $repository,
            $this->createMock(LoggerInterface::class),
        );

        $this->expectException(ConflictHttpException::class);

        $processor->process(new Vehicle(), new Delete());
    }

    public function testSoftDeletesWhenNoActiveSubmissions(): void
    {
        $vehicle = new Vehicle();

        $repository = $this->createMock(SubmissionRepository::class);
        $repository->method('findBy')->willReturn([]);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects($this->once())->method('flush');

        $processor = new VehicleDeleteProcessor(
            $entityManager,
            $repository,
            $this->createMock(LoggerInterface::class),
        );

        $result = $processor->process($vehicle, new Delete());

        $this->assertNull($result);
        $this->assertNotNull($vehicle->getDeletedAt());
    }
}
