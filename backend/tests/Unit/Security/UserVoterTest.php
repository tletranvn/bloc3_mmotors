<?php

namespace App\Tests\Unit\Security;

use App\Entity\User;
use App\Security\Voter\UserVoter;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class UserVoterTest extends TestCase
{
    private UserVoter $voter;

    protected function setUp(): void
    {
        $this->voter = new UserVoter();
    }

    private function createToken(User $user): TokenInterface
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);
        return $token;
    }

    private function createUser(string $role = 'ROLE_USER'): User
    {
        $user = new User();
        $user->setRoles($role === 'ROLE_ADMIN' ? ['ROLE_ADMIN'] : []);
        return $user;
    }

    public function testRoleUserAccedeASesPropresDonnees(): void
    {
        $user = $this->createUser();

        $result = $this->voter->vote($this->createToken($user), $user, [UserVoter::VIEW]);

        $this->assertSame(1, $result);
    }

    public function testRoleUserNAccedePasAuxDonneesDesAutres(): void
    {
        $user = $this->createUser();
        $other = $this->createUser();

        $result = $this->voter->vote($this->createToken($user), $other, [UserVoter::VIEW]);

        $this->assertSame(-1, $result);
    }

    public function testRoleAdminAccedeATout(): void
    {
        $admin = $this->createUser('ROLE_ADMIN');
        $other = $this->createUser();

        $result = $this->voter->vote($this->createToken($admin), $other, [UserVoter::VIEW]);

        $this->assertSame(1, $result);
    }

    public function testRoleUserPeutEditerSesPropresDonnees(): void
    {
        $user = $this->createUser();

        $result = $this->voter->vote($this->createToken($user), $user, [UserVoter::EDIT]);

        $this->assertSame(1, $result);
    }

    public function testRoleUserNePeutPasEditerLesDonneesDesAutres(): void
    {
        $user = $this->createUser();
        $other = $this->createUser();

        $result = $this->voter->vote($this->createToken($user), $other, [UserVoter::EDIT]);

        $this->assertSame(-1, $result);
    }

    public function testRoleAdminPeutEditerTout(): void
    {
        $admin = $this->createUser('ROLE_ADMIN');
        $other = $this->createUser();

        $result = $this->voter->vote($this->createToken($admin), $other, [UserVoter::EDIT]);

        $this->assertSame(1, $result);
    }
}
