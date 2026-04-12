<?php

namespace App\Tests\Unit\Security;

use App\Entity\Submission;
use App\Entity\User;
use App\Security\Voter\SubmissionVoter;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class SubmissionVoterTest extends TestCase
{
    private SubmissionVoter $voter;

    protected function setUp(): void
    {
        $this->voter = new SubmissionVoter();
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

    public function testRoleUserVoitSonPropressDossier(): void
    {
        $user = $this->createUser();
        $submission = new Submission();
        $submission->setClient($user);

        $result = $this->voter->vote($this->createToken($user), $submission, [SubmissionVoter::VIEW]);

        $this->assertSame(1, $result);
    }

    public function testRoleUserNeVoitPasLeDossierDUnAutre(): void
    {
        $owner = $this->createUser();
        $other = $this->createUser();
        $submission = new Submission();
        $submission->setClient($owner);

        $result = $this->voter->vote($this->createToken($other), $submission, [SubmissionVoter::VIEW]);

        $this->assertSame(-1, $result);
    }

    public function testRoleAdminVoitTousLesDossiers(): void
    {
        $admin = $this->createUser('ROLE_ADMIN');
        $owner = $this->createUser();
        $submission = new Submission();
        $submission->setClient($owner);

        $result = $this->voter->vote($this->createToken($admin), $submission, [SubmissionVoter::VIEW]);

        $this->assertSame(1, $result);
    }

    public function testRoleUserNePeutPasEditer(): void
    {
        $user = $this->createUser();
        $submission = new Submission();
        $submission->setClient($user);

        $result = $this->voter->vote($this->createToken($user), $submission, [SubmissionVoter::EDIT]);

        $this->assertSame(-1, $result);
    }

    public function testRoleAdminPeutEditer(): void
    {
        $admin = $this->createUser('ROLE_ADMIN');
        $submission = new Submission();
        $submission->setClient($this->createUser());

        $result = $this->voter->vote($this->createToken($admin), $submission, [SubmissionVoter::EDIT]);

        $this->assertSame(1, $result);
    }
}
