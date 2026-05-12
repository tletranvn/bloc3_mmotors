<?php

namespace App\Tests\Unit\State;

use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Submission;
use App\Entity\User;
use App\Entity\Vehicle;
use App\Service\RentalCalculatorService;
use App\State\SubmissionProcessor;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SubmissionProcessorTest extends TestCase
{
    private ProcessorInterface $innerProcessor;
    private Security $security;
    private RentalCalculatorService $rentalCalculator;
    private LoggerInterface $logger;
    private SubmissionProcessor $processor;
    private User $user;

    protected function setUp(): void
    {
        $this->innerProcessor   = $this->createMock(ProcessorInterface::class);
        $this->security         = $this->createMock(Security::class);
        $this->rentalCalculator = new RentalCalculatorService();
        $this->logger           = $this->createMock(LoggerInterface::class);

        $this->user = new User();
        $this->security->method('getUser')->willReturn($this->user);

        $this->processor = new SubmissionProcessor($this->innerProcessor, $this->security, $this->rentalCalculator, $this->logger);
    }

    private function makeVehicle(string $status = Vehicle::STATUS_AVAILABLE, string $availability = Vehicle::AVAILABILITY_SALE, ?string $rentalPrice = null): Vehicle
    {
        $vehicle = new Vehicle();
        $vehicle->setStatus($status);
        $vehicle->setAvailabilityType($availability);
        if ($rentalPrice !== null) {
            $vehicle->setRentalPriceMonthly($rentalPrice);
        }
        return $vehicle;
    }

    public function testAssignsClientAndForcesStatusPending(): void
    {
        $vehicle = $this->makeVehicle();

        $submission = new Submission();
        $submission->setVehicle($vehicle);
        $submission->setType(Submission::TYPE_SALE);

        $this->innerProcessor->expects($this->once())->method('process')->willReturn($submission);

        $this->processor->process($submission, new Post());

        $this->assertSame($this->user, $submission->getClient());
        $this->assertSame(Submission::STATUS_PENDING, $submission->getStatus());
    }

    public function testThrowsBadRequestIfNoVehicle(): void
    {
        $this->expectException(BadRequestHttpException::class);

        $submission = new Submission();
        $submission->setType(Submission::TYPE_SALE);

        $this->processor->process($submission, new Post());
    }

    public function testThrowsIfVehicleNotAvailable(): void
    {
        $this->expectException(UnprocessableEntityHttpException::class);

        $vehicle = $this->makeVehicle(Vehicle::STATUS_SOLD);
        $submission = new Submission();
        $submission->setVehicle($vehicle);
        $submission->setType(Submission::TYPE_SALE);

        $this->processor->process($submission, new Post());
    }

    public function testThrowsIfVehicleNotAvailableForSale(): void
    {
        $this->expectException(UnprocessableEntityHttpException::class);

        $vehicle = $this->makeVehicle(Vehicle::STATUS_AVAILABLE, Vehicle::AVAILABILITY_RENTAL);
        $submission = new Submission();
        $submission->setVehicle($vehicle);
        $submission->setType(Submission::TYPE_SALE);

        $this->processor->process($submission, new Post());
    }

    public function testThrowsIfVehicleNotAvailableForRental(): void
    {
        $this->expectException(UnprocessableEntityHttpException::class);

        $vehicle = $this->makeVehicle(Vehicle::STATUS_AVAILABLE, Vehicle::AVAILABILITY_SALE);
        $submission = new Submission();
        $submission->setVehicle($vehicle);
        $submission->setType(Submission::TYPE_RENTAL);

        $this->processor->process($submission, new Post());
    }

    public function testAcceptsSaleWhenAvailabilityIsBoth(): void
    {
        $vehicle = $this->makeVehicle(Vehicle::STATUS_AVAILABLE, Vehicle::AVAILABILITY_BOTH);
        $submission = new Submission();
        $submission->setVehicle($vehicle);
        $submission->setType(Submission::TYPE_SALE);

        $this->innerProcessor->expects($this->once())->method('process')->willReturn($submission);

        $this->processor->process($submission, new Post());
        $this->assertSame(Submission::STATUS_PENDING, $submission->getStatus());
    }

    public function testThrowsConflictOnDuplicateSubmission(): void
    {
        $this->expectException(ConflictHttpException::class);

        $vehicle = $this->makeVehicle();
        $submission = new Submission();
        $submission->setVehicle($vehicle);
        $submission->setType(Submission::TYPE_SALE);

        $driverException = $this->createMock(\Doctrine\DBAL\Driver\Exception::class);
        $this->innerProcessor
            ->method('process')
            ->willThrowException(new UniqueConstraintViolationException($driverException, null));

        $this->processor->process($submission, new Post());
    }

    public function testDelegatesNonSubmissionData(): void
    {
        $other = new \stdClass();

        $this->innerProcessor->expects($this->once())->method('process')->with($other)->willReturn($other);

        $result = $this->processor->process($other, new Post());
        $this->assertSame($other, $result);
    }

    public function testThrowsIfRentalMissingDuration(): void
    {
        $this->expectException(BadRequestHttpException::class);

        $vehicle = $this->makeVehicle(Vehicle::STATUS_AVAILABLE, Vehicle::AVAILABILITY_RENTAL, '350');
        $submission = new Submission();
        $submission->setVehicle($vehicle);
        $submission->setType(Submission::TYPE_RENTAL);
        $submission->setAnnualKm(10000);
        // duration non définie

        $this->processor->process($submission, new Post());
    }

    public function testThrowsIfRentalMissingAnnualKm(): void
    {
        $this->expectException(BadRequestHttpException::class);

        $vehicle = $this->makeVehicle(Vehicle::STATUS_AVAILABLE, Vehicle::AVAILABILITY_RENTAL, '350');
        $submission = new Submission();
        $submission->setVehicle($vehicle);
        $submission->setType(Submission::TYPE_RENTAL);
        $submission->setDuration(36);
        // annualKm non défini

        $this->processor->process($submission, new Post());
    }

    public function testThrowsIfRentalInvalidDuration(): void
    {
        $this->expectException(BadRequestHttpException::class);

        $vehicle = $this->makeVehicle(Vehicle::STATUS_AVAILABLE, Vehicle::AVAILABILITY_RENTAL, '350');
        $submission = new Submission();
        $submission->setVehicle($vehicle);
        $submission->setType(Submission::TYPE_RENTAL);
        $submission->setDuration(12); // valeur non autorisée
        $submission->setAnnualKm(10000);

        $this->processor->process($submission, new Post());
    }

    public function testThrowsIfRentalInvalidAnnualKm(): void
    {
        $this->expectException(BadRequestHttpException::class);

        $vehicle = $this->makeVehicle(Vehicle::STATUS_AVAILABLE, Vehicle::AVAILABILITY_RENTAL, '350');
        $submission = new Submission();
        $submission->setVehicle($vehicle);
        $submission->setType(Submission::TYPE_RENTAL);
        $submission->setDuration(36);
        $submission->setAnnualKm(99999); // valeur non autorisée

        $this->processor->process($submission, new Post());
    }

    public function testRentalCalculatesMonthlyTotalServerSide(): void
    {
        $vehicle = $this->makeVehicle(Vehicle::STATUS_AVAILABLE, Vehicle::AVAILABILITY_RENTAL, '350');
        $submission = new Submission();
        $submission->setVehicle($vehicle);
        $submission->setType(Submission::TYPE_RENTAL);
        $submission->setDuration(36);
        $submission->setAnnualKm(10000);
        // Le client envoie un montant arbitraire — le backend doit l'ignorer et recalculer
        $submission->setMonthlyTotal('999.99');

        $this->innerProcessor->expects($this->once())->method('process')->willReturn($submission);

        $this->processor->process($submission, new Post());

        // 350 × 1.00 + 0 = 350.00
        $this->assertSame('350.00', $submission->getMonthlyTotal());
    }

    public function testRentalAcceptsBothAvailabilityType(): void
    {
        $vehicle = $this->makeVehicle(Vehicle::STATUS_AVAILABLE, Vehicle::AVAILABILITY_BOTH, '400');
        $submission = new Submission();
        $submission->setVehicle($vehicle);
        $submission->setType(Submission::TYPE_RENTAL);
        $submission->setDuration(24);
        $submission->setAnnualKm(15000);

        $this->innerProcessor->expects($this->once())->method('process')->willReturn($submission);

        $this->processor->process($submission, new Post());

        // 400 × 1.10 + 15 = 440 + 15 = 455.00
        $this->assertSame('455.00', $submission->getMonthlyTotal());
    }
}
