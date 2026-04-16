<?php

namespace App\Tests\Unit\Command;

use App\Command\CreateAdminCommand;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class CreateAdminCommandTest extends TestCase
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;
    private CommandTester $tester;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->passwordHasher = $this->createMock(UserPasswordHasherInterface::class);

        $command = new CreateAdminCommand($this->entityManager, $this->passwordHasher);

        // L'Application enregistre le QuestionHelper (nécessaire pour les questions interactives)
        $application = new Application();
        $application->addCommand($command);

        $this->tester = new CommandTester($application->find('app:create-admin'));
    }

    public function testCreatesAdminUserSuccessfully(): void
    {
        $this->passwordHasher
            ->expects($this->once())
            ->method('hashPassword')
            ->willReturn('hashed_password');

        $persistedUser = null;
        $this->entityManager
            ->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (User $user) use (&$persistedUser) {
                $persistedUser = $user;
                return true;
            }));

        $this->entityManager
            ->expects($this->once())
            ->method('flush');

        $this->tester->setInputs(['SecurePass1!']);
        $this->tester->execute(['email' => 'admin@mmotors.fr']);

        $this->assertSame(Command::SUCCESS, $this->tester->getStatusCode());
        $this->assertStringContainsString('créé avec succès', $this->tester->getDisplay());

        // Vérifier les propriétés du user créé
        $this->assertNotNull($persistedUser);
        $this->assertSame('admin@mmotors.fr', $persistedUser->getEmail());
        $this->assertContains('ROLE_ADMIN', $persistedUser->getRoles());
        $this->assertSame('hashed_password', $persistedUser->getPassword());
    }

    public function testFailsIfPasswordIsEmpty(): void
    {
        $this->passwordHasher
            ->expects($this->never())
            ->method('hashPassword');

        $this->entityManager
            ->expects($this->never())
            ->method('persist');

        $this->tester->setInputs(['']);
        $this->tester->execute(['email' => 'admin@mmotors.fr']);

        $this->assertSame(Command::FAILURE, $this->tester->getStatusCode());
        $this->assertStringContainsString('ne peut pas être vide', $this->tester->getDisplay());
    }

    public function testHashesPasswordBeforePersist(): void
    {
        $capturedUser = null;

        $this->passwordHasher
            ->expects($this->once())
            ->method('hashPassword')
            ->with(
                $this->isInstanceOf(User::class),
                'MonMotDePasse1!'
            )
            ->willReturn('hash_bcrypt_fictif');

        $this->entityManager
            ->method('persist')
            ->with($this->callback(function (User $user) use (&$capturedUser) {
                $capturedUser = $user;
                return true;
            }));

        $this->tester->setInputs(['MonMotDePasse1!']);
        $this->tester->execute(['email' => 'test@mmotors.fr']);

        $this->assertSame('hash_bcrypt_fictif', $capturedUser?->getPassword());
    }
}
