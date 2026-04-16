<?php

namespace App\Tests\Unit\State;

use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\State\UserHashPasswordProcessor;
use PHPUnit\Framework\TestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserHashPasswordProcessorTest extends TestCase
{
    private ProcessorInterface $innerProcessor;
    private UserPasswordHasherInterface $passwordHasher;
    private UserHashPasswordProcessor $processor;

    protected function setUp(): void
    {
        // Créer des "faux" services avec createMock
        $this->innerProcessor = $this->createMock(ProcessorInterface::class);
        $this->passwordHasher = $this->createMock(UserPasswordHasherInterface::class);

        $this->processor = new UserHashPasswordProcessor(
            $this->innerProcessor,
            $this->passwordHasher,
        );
    }

    public function testHashesPlainPasswordBeforePersist(): void
    {
        $user = new User();
        $user->setPlainPassword('Plain1234!');

        // Le hasher doit être appelé une fois et retourne un hash fictif
        $this->passwordHasher
            ->expects($this->once())
            ->method('hashPassword')
            ->with($user, 'Plain1234!')
            ->willReturn('hashed_password');

        // Le processor suivant (persist) doit être appelé avec le user
        $this->innerProcessor
            ->expects($this->once())
            ->method('process')
            ->with($user)
            ->willReturn($user);

        $this->processor->process($user, new Post());

        // Le password hashé est bien assigné
        $this->assertSame('hashed_password', $user->getPassword());
    }

    public function testSkipsHashingIfNoPlainPassword(): void
    {
        $user = new User();
        // Pas de plainPassword → le hasher ne doit pas être appelé

        $this->passwordHasher
            ->expects($this->never())
            ->method('hashPassword');

        $this->innerProcessor
            ->expects($this->once())
            ->method('process')
            ->willReturn($user);

        $this->processor->process($user, new Post());
    }

    public function testDelegatesNonUserDataToInnerProcessor(): void
    {
        // Si la donnée n'est pas un User, passer directement au processor suivant
        $otherData = new \stdClass();

        $this->passwordHasher
            ->expects($this->never())
            ->method('hashPassword');

        $this->innerProcessor
            ->expects($this->once())
            ->method('process')
            ->with($otherData)
            ->willReturn($otherData);

        $result = $this->processor->process($otherData, new Post());

        $this->assertSame($otherData, $result);
    }
}
