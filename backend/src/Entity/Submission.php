<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\SubmissionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Get(security: "is_granted('ROLE_USER') and object.getClient() == user or is_granted('ROLE_ADMIN')"),
        new Post(security: "is_granted('ROLE_USER')", denormalizationContext: ['groups' => ['submission:write']]),
        new Put(security: "is_granted('ROLE_ADMIN')", denormalizationContext: ['groups' => ['submission:admin:write']]),
    ],
    normalizationContext: ['groups' => ['submission:read']],
    denormalizationContext: ['groups' => ['submission:write']],
)]
#[ORM\Entity(repositoryClass: SubmissionRepository::class)]
#[ORM\UniqueConstraint(name: 'uq_submission_client_vehicle_type', columns: ['client_id', 'vehicle_id', 'type'])]
class Submission
{
    public const TYPE_SALE = 'SALE';
    public const TYPE_RENTAL = 'RENTAL';

    public const STATUS_PENDING = 'PENDING';
    public const STATUS_APPROVED = 'APPROVED';
    public const STATUS_REJECTED = 'REJECTED';

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column]
    #[Groups(['submission:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 20)]
    #[Groups(['submission:read', 'submission:write'])]
    private ?string $type = null;

    #[ORM\Column(length: 20)]
    #[Groups(['submission:read', 'submission:admin:write'])]
    private ?string $status = null;

    #[ORM\Column(length: 100)]
    #[Groups(['submission:read', 'submission:write'])]
    private ?string $profession = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['submission:read', 'submission:write'])]
    private ?string $monthlyIncome = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['submission:read', 'submission:write'])]
    private ?int $duration = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['submission:read', 'submission:write'])]
    private ?int $annualKm = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['submission:read', 'submission:admin:write'])]
    private ?string $monthlyTotal = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['submission:read', 'submission:admin:write'])]
    private ?string $rejectionReason = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['submission:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'submissions')]
    #[Groups(['submission:read'])]
    private ?User $client = null;

    #[ORM\ManyToOne(targetEntity: Vehicle::class, inversedBy: 'submissions')]
    #[Groups(['submission:read', 'submission:write'])]
    private ?Vehicle $vehicle = null;

    /** @var Collection<int, Document> */
    #[ORM\OneToMany(targetEntity: Document::class, mappedBy: 'submission', cascade: ['remove'])]
    private Collection $documents;

    #[ORM\OneToOne(targetEntity: RentalContract::class, mappedBy: 'submission')]
    private ?RentalContract $rentalContract = null;

    public function __construct()
    {
        $this->documents = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->status = self::STATUS_PENDING;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getProfession(): ?string
    {
        return $this->profession;
    }

    public function setProfession(string $profession): static
    {
        $this->profession = $profession;
        return $this;
    }

    public function getMonthlyIncome(): ?string
    {
        return $this->monthlyIncome;
    }

    public function setMonthlyIncome(string $monthlyIncome): static
    {
        $this->monthlyIncome = $monthlyIncome;
        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(?int $duration): static
    {
        $this->duration = $duration;
        return $this;
    }

    public function getAnnualKm(): ?int
    {
        return $this->annualKm;
    }

    public function setAnnualKm(?int $annualKm): static
    {
        $this->annualKm = $annualKm;
        return $this;
    }

    public function getMonthlyTotal(): ?string
    {
        return $this->monthlyTotal;
    }

    public function setMonthlyTotal(?string $monthlyTotal): static
    {
        $this->monthlyTotal = $monthlyTotal;
        return $this;
    }

    public function getRejectionReason(): ?string
    {
        return $this->rejectionReason;
    }

    public function setRejectionReason(?string $rejectionReason): static
    {
        $this->rejectionReason = $rejectionReason;
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

    public function getClient(): ?User
    {
        return $this->client;
    }

    public function setClient(?User $client): static
    {
        $this->client = $client;
        return $this;
    }

    public function getVehicle(): ?Vehicle
    {
        return $this->vehicle;
    }

    public function setVehicle(?Vehicle $vehicle): static
    {
        $this->vehicle = $vehicle;
        return $this;
    }

    /** @return Collection<int, Document> */
    public function getDocuments(): Collection
    {
        return $this->documents;
    }

    public function addDocument(Document $document): static
    {
        if (!$this->documents->contains($document)) {
            $this->documents->add($document);
            $document->setSubmission($this);
        }
        return $this;
    }

    public function removeDocument(Document $document): static
    {
        if ($this->documents->removeElement($document)) {
            if ($document->getSubmission() === $this) {
                $document->setSubmission(null);
            }
        }
        return $this;
    }

    public function getRentalContract(): ?RentalContract
    {
        return $this->rentalContract;
    }

    public function setRentalContract(?RentalContract $rentalContract): static
    {
        if ($rentalContract !== null && $rentalContract->getSubmission() !== $this) {
            $rentalContract->setSubmission($this);
        }
        $this->rentalContract = $rentalContract;
        return $this;
    }
}
