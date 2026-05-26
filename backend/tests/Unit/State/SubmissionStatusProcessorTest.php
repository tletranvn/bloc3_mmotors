<?php

namespace App\Tests\Unit\State;

use ApiPlatform\Metadata\Patch;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Submission;
use App\Entity\Vehicle;
use App\Repository\SubmissionRepository;
use App\State\SubmissionStatusProcessor;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class SubmissionStatusProcessorTest extends TestCase
{
    private SubmissionStatusProcessor $processor;
    /** @var ProcessorInterface&MockObject */
    private ProcessorInterface $inner;
    /** @var SubmissionRepository&MockObject */
    private SubmissionRepository $repo;
    /** @var EntityManagerInterface&MockObject */
    private EntityManagerInterface $em;

    protected function setUp(): void
    {
        $this->inner = $this->createMock(ProcessorInterface::class);
        $this->repo  = $this->createMock(SubmissionRepository::class);
        $this->em    = $this->createMock(EntityManagerInterface::class);

        $this->processor = new SubmissionStatusProcessor($this->inner, $this->repo, $this->em);
    }

    private function makeSubmission(string $type, string $status, Vehicle $vehicle): Submission
    {
        $submission = new Submission();
        $submission->setType($type);
        $submission->setStatus($status);
        $submission->setVehicle($vehicle);
        $submission->setMonthlyIncome('2000');
        return $submission;
    }

    public function testApproveRentalSetsVehicleOnLease(): void
    {
        $vehicle = new Vehicle();
        $vehicle->setAvailabilityType(Vehicle::AVAILABILITY_RENTAL);
        $vehicle->setStatus(Vehicle::STATUS_AVAILABLE);

        $submission = $this->makeSubmission(Submission::TYPE_RENTAL, Submission::STATUS_APPROVED, $vehicle);

        $this->inner->method('process')->willReturn($submission);
        $this->em->expects($this->once())->method('flush');

        $this->processor->process($submission, new Patch());

        $this->assertSame(Vehicle::STATUS_ON_LEASE, $vehicle->getStatus());
    }

    public function testApproveSaleSetsVehicleReserved(): void
    {
        $vehicle = new Vehicle();
        $vehicle->setAvailabilityType(Vehicle::AVAILABILITY_SALE);
        $vehicle->setStatus(Vehicle::STATUS_AVAILABLE);

        $submission = $this->makeSubmission(Submission::TYPE_SALE, Submission::STATUS_APPROVED, $vehicle);

        $this->inner->method('process')->willReturn($submission);
        $this->em->expects($this->once())->method('flush');

        $this->processor->process($submission, new Patch());

        $this->assertSame(Vehicle::STATUS_RESERVED, $vehicle->getStatus());
    }

    public function testRejectWithNoOtherActiveSubmissionSetsVehicleAvailable(): void
    {
        $vehicle = new Vehicle();
        $vehicle->setAvailabilityType(Vehicle::AVAILABILITY_SALE);
        $vehicle->setStatus(Vehicle::STATUS_RESERVED);

        $submission = $this->makeSubmission(Submission::TYPE_SALE, Submission::STATUS_REJECTED, $vehicle);

        $this->inner->method('process')->willReturn($submission);
        $this->repo->method('hasActiveSubmissionForVehicle')->willReturn(false);
        $this->em->expects($this->once())->method('flush');

        $this->processor->process($submission, new Patch());

        $this->assertSame(Vehicle::STATUS_AVAILABLE, $vehicle->getStatus());
    }

    public function testRejectWithOtherActiveSubmissionKeepsStatus(): void
    {
        $vehicle = new Vehicle();
        $vehicle->setAvailabilityType(Vehicle::AVAILABILITY_SALE);
        $vehicle->setStatus(Vehicle::STATUS_RESERVED);

        $submission = $this->makeSubmission(Submission::TYPE_SALE, Submission::STATUS_REJECTED, $vehicle);

        $this->inner->method('process')->willReturn($submission);
        $this->repo->method('hasActiveSubmissionForVehicle')->willReturn(true);
        $this->em->expects($this->never())->method('flush');

        $this->processor->process($submission, new Patch());

        $this->assertSame(Vehicle::STATUS_RESERVED, $vehicle->getStatus());
    }

    public function testPendingStatusDoesNotChangeVehicle(): void
    {
        $vehicle = new Vehicle();
        $vehicle->setAvailabilityType(Vehicle::AVAILABILITY_SALE);
        $vehicle->setStatus(Vehicle::STATUS_AVAILABLE);

        $submission = $this->makeSubmission(Submission::TYPE_SALE, Submission::STATUS_PENDING, $vehicle);

        $this->inner->method('process')->willReturn($submission);
        $this->em->expects($this->never())->method('flush');

        $this->processor->process($submission, new Patch());

        $this->assertSame(Vehicle::STATUS_AVAILABLE, $vehicle->getStatus());
    }
}
