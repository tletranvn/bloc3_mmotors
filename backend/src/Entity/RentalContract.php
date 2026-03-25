<?php

namespace App\Entity;

use App\Repository\RentalContractRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RentalContractRepository::class)]
class RentalContract
{
    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_TERMINATED = 'TERMINATED';
    public const STATUS_PURCHASED = 'PURCHASED';

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $startDate = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $endDate = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $monthlyPayment = null;

    #[ORM\Column(length: 20)]
    private ?string $contractStatus = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $purchaseOptionPrice = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $lastPaymentDate = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $nextPaymentDue = null;

    #[ORM\Column]
    private ?int $paymentsReceived = null;

    #[ORM\Column]
    private ?int $totalPayments = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\OneToOne(targetEntity: Submission::class, inversedBy: 'rentalContract')]
    #[ORM\JoinColumn(nullable: false, unique: true)]
    private ?Submission $submission = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->contractStatus = self::STATUS_ACTIVE;
        $this->paymentsReceived = 0;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStartDate(): ?\DateTimeInterface
    {
        return $this->startDate;
    }

    public function setStartDate(\DateTimeInterface $startDate): static
    {
        $this->startDate = $startDate;
        return $this;
    }

    public function getEndDate(): ?\DateTimeInterface
    {
        return $this->endDate;
    }

    public function setEndDate(\DateTimeInterface $endDate): static
    {
        $this->endDate = $endDate;
        return $this;
    }

    public function getMonthlyPayment(): ?string
    {
        return $this->monthlyPayment;
    }

    public function setMonthlyPayment(string $monthlyPayment): static
    {
        $this->monthlyPayment = $monthlyPayment;
        return $this;
    }

    public function getContractStatus(): ?string
    {
        return $this->contractStatus;
    }

    public function setContractStatus(string $contractStatus): static
    {
        $this->contractStatus = $contractStatus;
        return $this;
    }

    public function getPurchaseOptionPrice(): ?string
    {
        return $this->purchaseOptionPrice;
    }

    public function setPurchaseOptionPrice(?string $purchaseOptionPrice): static
    {
        $this->purchaseOptionPrice = $purchaseOptionPrice;
        return $this;
    }

    public function getLastPaymentDate(): ?\DateTimeInterface
    {
        return $this->lastPaymentDate;
    }

    public function setLastPaymentDate(?\DateTimeInterface $lastPaymentDate): static
    {
        $this->lastPaymentDate = $lastPaymentDate;
        return $this;
    }

    public function getNextPaymentDue(): ?\DateTimeInterface
    {
        return $this->nextPaymentDue;
    }

    public function setNextPaymentDue(?\DateTimeInterface $nextPaymentDue): static
    {
        $this->nextPaymentDue = $nextPaymentDue;
        return $this;
    }

    public function getPaymentsReceived(): ?int
    {
        return $this->paymentsReceived;
    }

    public function setPaymentsReceived(int $paymentsReceived): static
    {
        $this->paymentsReceived = $paymentsReceived;
        return $this;
    }

    public function getTotalPayments(): ?int
    {
        return $this->totalPayments;
    }

    public function setTotalPayments(int $totalPayments): static
    {
        $this->totalPayments = $totalPayments;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeInterface $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getSubmission(): ?Submission
    {
        return $this->submission;
    }

    public function setSubmission(Submission $submission): static
    {
        $this->submission = $submission;
        return $this;
    }
}
