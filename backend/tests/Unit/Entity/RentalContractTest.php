<?php

namespace App\Tests\Unit\Entity;

use App\Entity\RentalContract;
use App\Entity\Submission;
use PHPUnit\Framework\TestCase;

class RentalContractTest extends TestCase
{
    private RentalContract $contract;

    protected function setUp(): void
    {
        $this->contract = new RentalContract();
    }

    public function testConstructorInitializesDefaults(): void
    {
        $this->assertSame(RentalContract::STATUS_ACTIVE, $this->contract->getContractStatus());
        $this->assertSame(0, $this->contract->getPaymentsReceived());
        $this->assertInstanceOf(\DateTimeInterface::class, $this->contract->getCreatedAt());
        $this->assertNull($this->contract->getId());
    }

    public function testSetGetStartDate(): void
    {
        $date = new \DateTime('2025-01-01');
        $this->contract->setStartDate($date);
        $this->assertSame($date, $this->contract->getStartDate());
    }

    public function testSetGetEndDate(): void
    {
        $date = new \DateTime('2028-01-01');
        $this->contract->setEndDate($date);
        $this->assertSame($date, $this->contract->getEndDate());
    }

    public function testSetGetMonthlyPayment(): void
    {
        $this->contract->setMonthlyPayment('450.00');
        $this->assertSame('450.00', $this->contract->getMonthlyPayment());
    }

    public function testSetGetContractStatus(): void
    {
        $this->contract->setContractStatus(RentalContract::STATUS_TERMINATED);
        $this->assertSame(RentalContract::STATUS_TERMINATED, $this->contract->getContractStatus());
    }

    public function testSetGetPurchaseOptionPrice(): void
    {
        $this->contract->setPurchaseOptionPrice('15000.00');
        $this->assertSame('15000.00', $this->contract->getPurchaseOptionPrice());
    }

    public function testPurchaseOptionPriceNullable(): void
    {
        $this->contract->setPurchaseOptionPrice(null);
        $this->assertNull($this->contract->getPurchaseOptionPrice());
    }

    public function testSetGetLastPaymentDate(): void
    {
        $date = new \DateTime('2025-03-01');
        $this->contract->setLastPaymentDate($date);
        $this->assertSame($date, $this->contract->getLastPaymentDate());
    }

    public function testLastPaymentDateNullable(): void
    {
        $this->contract->setLastPaymentDate(null);
        $this->assertNull($this->contract->getLastPaymentDate());
    }

    public function testSetGetNextPaymentDue(): void
    {
        $date = new \DateTime('2025-04-01');
        $this->contract->setNextPaymentDue($date);
        $this->assertSame($date, $this->contract->getNextPaymentDue());
    }

    public function testNextPaymentDueNullable(): void
    {
        $this->contract->setNextPaymentDue(null);
        $this->assertNull($this->contract->getNextPaymentDue());
    }

    public function testSetGetPaymentsReceived(): void
    {
        $this->contract->setPaymentsReceived(5);
        $this->assertSame(5, $this->contract->getPaymentsReceived());
    }

    public function testSetGetTotalPayments(): void
    {
        $this->contract->setTotalPayments(36);
        $this->assertSame(36, $this->contract->getTotalPayments());
    }

    public function testSetGetCreatedAt(): void
    {
        $date = new \DateTime('2025-01-01');
        $this->contract->setCreatedAt($date);
        $this->assertSame($date, $this->contract->getCreatedAt());
    }

    public function testSetGetUpdatedAt(): void
    {
        $date = new \DateTime();
        $this->contract->setUpdatedAt($date);
        $this->assertSame($date, $this->contract->getUpdatedAt());
    }

    public function testUpdatedAtNullable(): void
    {
        $this->contract->setUpdatedAt(null);
        $this->assertNull($this->contract->getUpdatedAt());
    }

    public function testSetGetSubmission(): void
    {
        $submission = new Submission();
        $this->contract->setSubmission($submission);
        $this->assertSame($submission, $this->contract->getSubmission());
    }
}
