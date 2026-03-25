<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\VehicleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['vehicle:read']],
    denormalizationContext: ['groups' => ['vehicle:write']],
    paginationMaximumItemsPerPage: 100,
)]
#[ORM\Entity(repositoryClass: VehicleRepository::class)]
class Vehicle
{
    public const FUEL_GASOLINE = 'GASOLINE';
    public const FUEL_DIESEL = 'DIESEL';
    public const FUEL_HYBRID = 'HYBRID';
    public const FUEL_ELECTRIC = 'ELECTRIC';

    public const AVAILABILITY_SALE = 'SALE';
    public const AVAILABILITY_RENTAL = 'RENTAL';
    public const AVAILABILITY_BOTH = 'BOTH';

    public const STATUS_AVAILABLE = 'AVAILABLE';
    public const STATUS_RESERVED = 'RESERVED';
    public const STATUS_SOLD = 'SOLD';
    public const STATUS_ON_LEASE = 'ON_LEASE';
    public const STATUS_MAINTENANCE = 'MAINTENANCE';

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column]
    #[Groups(['vehicle:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $brand = null;

    #[ORM\Column(length: 100)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $model = null;

    #[ORM\Column]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?int $year = null;

    #[ORM\Column]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?int $mileage = null;

    #[ORM\Column(length: 20)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $fuelType = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $color = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $salePrice = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $rentalPriceMonthly = null;

    #[ORM\Column(length: 20)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $availabilityType = null;

    #[ORM\Column(length: 20)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $status = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $description = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['vehicle:read', 'vehicle:write'])]
    private ?string $imageUrl = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $deletedAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['vehicle:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $updatedAt = null;

    /** @var Collection<int, Submission> */
    #[ORM\OneToMany(targetEntity: Submission::class, mappedBy: 'vehicle')]
    private Collection $submissions;

    public function __construct()
    {
        $this->submissions = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->status = self::STATUS_AVAILABLE;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBrand(): ?string
    {
        return $this->brand;
    }

    public function setBrand(string $brand): static
    {
        $this->brand = $brand;
        return $this;
    }

    public function getModel(): ?string
    {
        return $this->model;
    }

    public function setModel(string $model): static
    {
        $this->model = $model;
        return $this;
    }

    public function getYear(): ?int
    {
        return $this->year;
    }

    public function setYear(int $year): static
    {
        $this->year = $year;
        return $this;
    }

    public function getMileage(): ?int
    {
        return $this->mileage;
    }

    public function setMileage(int $mileage): static
    {
        $this->mileage = $mileage;
        return $this;
    }

    public function getFuelType(): ?string
    {
        return $this->fuelType;
    }

    public function setFuelType(string $fuelType): static
    {
        $this->fuelType = $fuelType;
        return $this;
    }

    public function getFuelTypeLabel(): string
    {
        return match ($this->fuelType) {
            self::FUEL_GASOLINE => 'Essence',
            self::FUEL_DIESEL => 'Diesel',
            self::FUEL_HYBRID => 'Hybride',
            self::FUEL_ELECTRIC => 'Électrique',
            default => $this->fuelType ?? '',
        };
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(?string $color): static
    {
        $this->color = $color;
        return $this;
    }

    public function getSalePrice(): ?string
    {
        return $this->salePrice;
    }

    public function setSalePrice(?string $salePrice): static
    {
        $this->salePrice = $salePrice;
        return $this;
    }

    public function getRentalPriceMonthly(): ?string
    {
        return $this->rentalPriceMonthly;
    }

    public function setRentalPriceMonthly(?string $rentalPriceMonthly): static
    {
        $this->rentalPriceMonthly = $rentalPriceMonthly;
        return $this;
    }

    public function getAvailabilityType(): ?string
    {
        return $this->availabilityType;
    }

    public function setAvailabilityType(string $availabilityType): static
    {
        $this->availabilityType = $availabilityType;
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }

    public function setImageUrl(?string $imageUrl): static
    {
        $this->imageUrl = $imageUrl;
        return $this;
    }

    public function getDeletedAt(): ?\DateTimeInterface
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?\DateTimeInterface $deletedAt): static
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
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

    /** @return Collection<int, Submission> */
    public function getSubmissions(): Collection
    {
        return $this->submissions;
    }

    public function addSubmission(Submission $submission): static
    {
        if (!$this->submissions->contains($submission)) {
            $this->submissions->add($submission);
            $submission->setVehicle($this);
        }
        return $this;
    }

    public function removeSubmission(Submission $submission): static
    {
        if ($this->submissions->removeElement($submission)) {
            if ($submission->getVehicle() === $this) {
                $submission->setVehicle(null);
            }
        }
        return $this;
    }
}
