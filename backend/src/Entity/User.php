<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new Get(security: "is_granted('ROLE_USER') and object == user or is_granted('ROLE_ADMIN')"),
        new GetCollection(security: "is_granted('ROLE_ADMIN')"),
        new Post(uriTemplate: '/register', security: "is_granted('PUBLIC_ACCESS')"),
        new Put(security: "is_granted('ROLE_USER') and object == user or is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => [self::GROUP_READ]],
    denormalizationContext: ['groups' => [self::GROUP_WRITE]],
)]
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'uniq_identifier_email', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    public const ROLE_ADMIN = 'ROLE_ADMIN';
    public const ROLE_USER = 'ROLE_USER';

    private const GROUP_READ = self::GROUP_READ;
    private const GROUP_WRITE = self::GROUP_WRITE;

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column]
    #[Groups([self::GROUP_READ])]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Groups([self::GROUP_READ, self::GROUP_WRITE])]
    private ?string $email = null;

    /** @var list<string> */
    #[ORM\Column(type: Types::JSON)]
    #[Groups([self::GROUP_READ])]
    private array $roles = [];

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[Groups([self::GROUP_WRITE])]
    private ?string $plainPassword = null;

    #[ORM\Column(length: 50)]
    #[Groups([self::GROUP_READ, self::GROUP_WRITE])]
    private ?string $firstName = null;

    #[ORM\Column(length: 50)]
    #[Groups([self::GROUP_READ, self::GROUP_WRITE])]
    private ?string $lastName = null;

    #[ORM\Column(length: 20)]
    #[Groups([self::GROUP_READ, self::GROUP_WRITE])]
    private ?string $phone = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups([self::GROUP_READ, self::GROUP_WRITE])]
    private ?string $address = null;

    #[ORM\Column(nullable: true)]
    #[Groups([self::GROUP_READ, self::GROUP_WRITE])]
    private ?bool $rgpdConsent = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups([self::GROUP_READ])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $updatedAt = null;

    /** @var Collection<int, Submission> */
    #[ORM\OneToMany(targetEntity: Submission::class, mappedBy: 'client')]
    private Collection $submissions;

    public function __construct()
    {
        $this->submissions = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->roles = [self::ROLE_USER];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /** @return list<string> */
    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = self::ROLE_USER;
        return array_unique($roles);
    }

    /** @param list<string> $roles */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): static
    {
        $this->plainPassword = $plainPassword;
        return $this;
    }

    public function eraseCredentials(): void
    {
        $this->plainPassword = null;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;
        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;
        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): static
    {
        $this->phone = $phone;
        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): static
    {
        $this->address = $address;
        return $this;
    }

    public function getRgpdConsent(): ?bool
    {
        return $this->rgpdConsent;
    }

    public function setRgpdConsent(?bool $rgpdConsent): static
    {
        $this->rgpdConsent = $rgpdConsent;
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

    /** @return Collection<int, Submission> */
    public function getSubmissions(): Collection
    {
        return $this->submissions;
    }

    public function addSubmission(Submission $submission): static
    {
        if (!$this->submissions->contains($submission)) {
            $this->submissions->add($submission);
            $submission->setClient($this);
        }
        return $this;
    }

    public function removeSubmission(Submission $submission): static
    {
        if ($this->submissions->removeElement($submission) && $submission->getClient() === $this) {
            $submission->setClient(null);
        }
        return $this;
    }
}
