<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Document;
use App\Entity\RentalContract;
use App\Entity\Submission;
use App\Entity\User;
use App\Entity\Vehicle;
use PHPUnit\Framework\TestCase;

class SubmissionTest extends TestCase
{
    private Submission $submission;

    protected function setUp(): void
    {
        $this->submission = new Submission();
    }

    public function testConstructorInitializesDefaults(): void
    {
        $this->assertSame(Submission::STATUS_PENDING, $this->submission->getStatus());
        $this->assertInstanceOf(\DateTimeInterface::class, $this->submission->getCreatedAt());
        $this->assertNull($this->submission->getId());
    }

    public function testSetGetType(): void
    {
        $this->submission->setType(Submission::TYPE_SALE);
        $this->assertSame(Submission::TYPE_SALE, $this->submission->getType());
    }

    public function testSetGetStatus(): void
    {
        $this->submission->setStatus(Submission::STATUS_APPROVED);
        $this->assertSame(Submission::STATUS_APPROVED, $this->submission->getStatus());
    }

    public function testSetGetProfession(): void
    {
        $this->submission->setProfession('Développeur');
        $this->assertSame('Développeur', $this->submission->getProfession());
    }

    public function testSetGetMonthlyIncome(): void
    {
        $this->submission->setMonthlyIncome('3500.00');
        $this->assertSame('3500.00', $this->submission->getMonthlyIncome());
    }

    public function testSetGetDuration(): void
    {
        $this->submission->setDuration(36);
        $this->assertSame(36, $this->submission->getDuration());
    }

    public function testDurationNullable(): void
    {
        $this->submission->setDuration(null);
        $this->assertNull($this->submission->getDuration());
    }

    public function testSetGetAnnualKm(): void
    {
        $this->submission->setAnnualKm(15000);
        $this->assertSame(15000, $this->submission->getAnnualKm());
    }

    public function testAnnualKmNullable(): void
    {
        $this->submission->setAnnualKm(null);
        $this->assertNull($this->submission->getAnnualKm());
    }

    public function testSetGetMonthlyTotal(): void
    {
        $this->submission->setMonthlyTotal('450.00');
        $this->assertSame('450.00', $this->submission->getMonthlyTotal());
    }

    public function testMonthlyTotalNullable(): void
    {
        $this->submission->setMonthlyTotal(null);
        $this->assertNull($this->submission->getMonthlyTotal());
    }

    public function testSetGetRejectionReason(): void
    {
        $this->submission->setRejectionReason('Revenus insuffisants');
        $this->assertSame('Revenus insuffisants', $this->submission->getRejectionReason());
    }

    public function testRejectionReasonNullable(): void
    {
        $this->submission->setRejectionReason(null);
        $this->assertNull($this->submission->getRejectionReason());
    }

    public function testSetGetCreatedAt(): void
    {
        $date = new \DateTime('2025-01-01');
        $this->submission->setCreatedAt($date);
        $this->assertSame($date, $this->submission->getCreatedAt());
    }

    public function testSetGetUpdatedAt(): void
    {
        $date = new \DateTime();
        $this->submission->setUpdatedAt($date);
        $this->assertSame($date, $this->submission->getUpdatedAt());
    }

    public function testUpdatedAtNullable(): void
    {
        $this->submission->setUpdatedAt(null);
        $this->assertNull($this->submission->getUpdatedAt());
    }

    public function testSetGetClient(): void
    {
        $user = new User();
        $this->submission->setClient($user);
        $this->assertSame($user, $this->submission->getClient());
    }

    public function testSetClientNull(): void
    {
        $this->submission->setClient(null);
        $this->assertNull($this->submission->getClient());
    }

    public function testSetGetVehicle(): void
    {
        $vehicle = new Vehicle();
        $this->submission->setVehicle($vehicle);
        $this->assertSame($vehicle, $this->submission->getVehicle());
    }

    public function testSetVehicleNull(): void
    {
        $this->submission->setVehicle(null);
        $this->assertNull($this->submission->getVehicle());
    }

    public function testGetRentalContractNullByDefault(): void
    {
        $this->assertNull($this->submission->getRentalContract());
    }

    public function testSetGetRentalContract(): void
    {
        $contract = new RentalContract();
        $this->submission->setRentalContract($contract);
        $this->assertSame($contract, $this->submission->getRentalContract());
    }

    public function testGetDocumentsEmptyByDefault(): void
    {
        $this->assertCount(0, $this->submission->getDocuments());
    }

    public function testAddDocument(): void
    {
        $document = new Document();
        $this->submission->addDocument($document);
        $this->assertCount(1, $this->submission->getDocuments());
        $this->assertSame($this->submission, $document->getSubmission());
    }

    public function testAddDocumentNoDuplicate(): void
    {
        $document = new Document();
        $this->submission->addDocument($document);
        $this->submission->addDocument($document);
        $this->assertCount(1, $this->submission->getDocuments());
    }

    public function testRemoveDocument(): void
    {
        $document = new Document();
        $this->submission->addDocument($document);
        $this->submission->removeDocument($document);
        $this->assertCount(0, $this->submission->getDocuments());
        $this->assertNull($document->getSubmission());
    }
}
