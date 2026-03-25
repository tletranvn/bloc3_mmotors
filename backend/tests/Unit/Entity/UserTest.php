<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Submission;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    private User $user;

    protected function setUp(): void
    {
        $this->user = new User();
    }

    public function testConstructorInitializesDefaults(): void
    {
        $this->assertSame(['ROLE_USER'], $this->user->getRoles());
        $this->assertInstanceOf(\DateTimeInterface::class, $this->user->getCreatedAt());
        $this->assertNull($this->user->getId());
    }

    public function testSetGetEmail(): void
    {
        $this->user->setEmail('test@example.com');
        $this->assertSame('test@example.com', $this->user->getEmail());
    }

    public function testGetUserIdentifierReturnsEmail(): void
    {
        $this->user->setEmail('test@example.com');
        $this->assertSame('test@example.com', $this->user->getUserIdentifier());
    }

    public function testGetRolesAlwaysIncludesRoleUser(): void
    {
        $this->user->setRoles(['ROLE_ADMIN']);
        $roles = $this->user->getRoles();
        $this->assertContains('ROLE_USER', $roles);
        $this->assertContains('ROLE_ADMIN', $roles);
    }

    public function testSetGetPassword(): void
    {
        $this->user->setPassword('hashed_password');
        $this->assertSame('hashed_password', $this->user->getPassword());
    }

    public function testSetGetPlainPassword(): void
    {
        $this->user->setPlainPassword('plain123');
        $this->assertSame('plain123', $this->user->getPlainPassword());
    }

    public function testPlainPasswordNullByDefault(): void
    {
        $this->assertNull($this->user->getPlainPassword());
    }

    public function testEraseCredentialsClearsPlainPassword(): void
    {
        $this->user->setPlainPassword('plain123');
        $this->user->eraseCredentials();
        $this->assertNull($this->user->getPlainPassword());
    }

    public function testSetGetFirstName(): void
    {
        $this->user->setFirstName('Marie');
        $this->assertSame('Marie', $this->user->getFirstName());
    }

    public function testSetGetLastName(): void
    {
        $this->user->setLastName('Dupont');
        $this->assertSame('Dupont', $this->user->getLastName());
    }

    public function testSetGetPhone(): void
    {
        $this->user->setPhone('0601020304');
        $this->assertSame('0601020304', $this->user->getPhone());
    }

    public function testSetGetAddress(): void
    {
        $this->user->setAddress('12 rue des Lilas');
        $this->assertSame('12 rue des Lilas', $this->user->getAddress());
    }

    public function testAddressNullable(): void
    {
        $this->user->setAddress(null);
        $this->assertNull($this->user->getAddress());
    }

    public function testSetGetRgpdConsent(): void
    {
        $this->assertNull($this->user->getRgpdConsent());
        $this->user->setRgpdConsent(true);
        $this->assertTrue($this->user->getRgpdConsent());
    }

    public function testSetGetCreatedAt(): void
    {
        $date = new \DateTime('2025-01-01');
        $this->user->setCreatedAt($date);
        $this->assertSame($date, $this->user->getCreatedAt());
    }

    public function testSetGetUpdatedAt(): void
    {
        $this->assertNull($this->user->getUpdatedAt());
        $date = new \DateTime();
        $this->user->setUpdatedAt($date);
        $this->assertSame($date, $this->user->getUpdatedAt());
    }

    public function testUpdatedAtNullable(): void
    {
        $this->user->setUpdatedAt(null);
        $this->assertNull($this->user->getUpdatedAt());
    }

    public function testGetSubmissionsEmptyByDefault(): void
    {
        $this->assertCount(0, $this->user->getSubmissions());
    }

    public function testAddSubmission(): void
    {
        $submission = new Submission();
        $this->user->addSubmission($submission);
        $this->assertCount(1, $this->user->getSubmissions());
        $this->assertSame($this->user, $submission->getClient());
    }

    public function testAddSubmissionNoDuplicate(): void
    {
        $submission = new Submission();
        $this->user->addSubmission($submission);
        $this->user->addSubmission($submission);
        $this->assertCount(1, $this->user->getSubmissions());
    }

    public function testRemoveSubmission(): void
    {
        $submission = new Submission();
        $this->user->addSubmission($submission);
        $this->user->removeSubmission($submission);
        $this->assertCount(0, $this->user->getSubmissions());
        $this->assertNull($submission->getClient());
    }
}
