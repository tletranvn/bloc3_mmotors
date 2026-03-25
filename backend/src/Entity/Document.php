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
    normalizationContext: ['groups' => ['document:read']],
    denormalizationContext: ['groups' => ['document:write']],
    paginationMaximumItemsPerPage: 50,
)]
#[ORM\Entity(repositoryClass: DocumentRepository::class)]
class Document
{
    public const TYPE_IDENTITY = 'IDENTITY';
    public const TYPE_ADDRESS = 'ADDRESS';
    public const TYPE_RIB = 'RIB';
    public const TYPE_PAYSLIP = 'PAYSLIP';

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column]
    #[Groups(['document:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Groups(['document:read', 'document:write'])]
    private ?string $documentType = null;

    #[ORM\Column(length: 500)]
    #[Groups(['document:read', 'document:write'])]
    private ?string $documentUrl = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['document:read'])]
    private ?\DateTimeInterface $uploadedAt = null;

    #[ORM\ManyToOne(targetEntity: Submission::class, inversedBy: 'documents')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['document:read', 'document:write'])]
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
