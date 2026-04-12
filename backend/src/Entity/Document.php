<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\DocumentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Get(security: "is_granted('ROLE_ADMIN') or (is_granted('ROLE_USER') and object.getSubmission().getClient() == user)"),
        new Post(security: "is_granted('ROLE_USER')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => [self::GROUP_READ]],
    denormalizationContext: ['groups' => [self::GROUP_WRITE]],
    paginationMaximumItemsPerPage: 50,
)]
#[ORM\Entity(repositoryClass: DocumentRepository::class)]
class Document
{
    public const TYPE_IDENTITY = 'IDENTITY';
    public const TYPE_ADDRESS = 'ADDRESS';
    public const TYPE_RIB = 'RIB';
    public const TYPE_PAYSLIP = 'PAYSLIP';

    private const GROUP_READ = 'document:read';
    private const GROUP_WRITE = 'document:write';

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column]
    #[Groups([self::GROUP_READ])]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Groups([self::GROUP_READ, self::GROUP_WRITE])]
    private ?string $documentType = null;

    #[ORM\Column(length: 500)]
    #[Groups([self::GROUP_READ, self::GROUP_WRITE])]
    private ?string $documentUrl = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups([self::GROUP_READ])]
    private ?\DateTimeInterface $uploadedAt = null;

    #[ORM\ManyToOne(targetEntity: Submission::class, inversedBy: 'documents')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups([self::GROUP_READ, self::GROUP_WRITE])]
    private ?Submission $submission = null;

    public function __construct()
    {
        $this->uploadedAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDocumentType(): ?string
    {
        return $this->documentType;
    }

    public function setDocumentType(string $documentType): static
    {
        $this->documentType = $documentType;
        return $this;
    }

    public function getDocumentUrl(): ?string
    {
        return $this->documentUrl;
    }

    public function setDocumentUrl(string $documentUrl): static
    {
        $this->documentUrl = $documentUrl;
        return $this;
    }

    public function getUploadedAt(): ?\DateTimeInterface
    {
        return $this->uploadedAt;
    }

    public function setUploadedAt(\DateTimeInterface $uploadedAt): static
    {
        $this->uploadedAt = $uploadedAt;
        return $this;
    }

    public function getSubmission(): ?Submission
    {
        return $this->submission;
    }

    public function setSubmission(?Submission $submission): static
    {
        $this->submission = $submission;
        return $this;
    }
}
