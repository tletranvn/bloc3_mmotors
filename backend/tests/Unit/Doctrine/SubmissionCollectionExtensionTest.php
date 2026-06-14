<?php

namespace App\Tests\Unit\Doctrine;

use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use App\Doctrine\SubmissionCollectionExtension;
use App\Entity\Submission;
use App\Entity\User;
use App\Entity\Vehicle;
use Doctrine\ORM\QueryBuilder;
use PHPUnit\Framework\TestCase;
use Symfony\Bundle\SecurityBundle\Security;

class SubmissionCollectionExtensionTest extends TestCase
{
    private function makeExtension(Security $security): SubmissionCollectionExtension
    {
        return new SubmissionCollectionExtension($security);
    }

    public function testIgnoresResourceOtherThanSubmission(): void
    {
        $security = $this->createMock(Security::class);
        $queryBuilder = $this->createMock(QueryBuilder::class);
        $queryBuilder->expects($this->never())->method('andWhere');

        $this->makeExtension($security)->applyToCollection(
            $queryBuilder,
            $this->createMock(QueryNameGeneratorInterface::class),
            Vehicle::class,
        );
    }

    public function testAdminSeesAllSubmissionsWithoutFilter(): void
    {
        $security = $this->createMock(Security::class);
        $security->method('isGranted')->with('ROLE_ADMIN')->willReturn(true);

        $queryBuilder = $this->createMock(QueryBuilder::class);
        $queryBuilder->expects($this->never())->method('andWhere');

        $this->makeExtension($security)->applyToCollection(
            $queryBuilder,
            $this->createMock(QueryNameGeneratorInterface::class),
            Submission::class,
        );
    }

    public function testNonAdminIsRestrictedToOwnSubmissions(): void
    {
        $user = new User();

        $security = $this->createMock(Security::class);
        $security->method('isGranted')->with('ROLE_ADMIN')->willReturn(false);
        $security->method('getUser')->willReturn($user);

        $queryBuilder = $this->createMock(QueryBuilder::class);
        $queryBuilder->method('getRootAliases')->willReturn(['s']);
        $queryBuilder->expects($this->once())
            ->method('andWhere')
            ->with('s.client = :current_user')
            ->willReturnSelf();
        $queryBuilder->expects($this->once())
            ->method('setParameter')
            ->with('current_user', $user)
            ->willReturnSelf();
        $queryBuilder->expects($this->once())
            ->method('addOrderBy')
            ->with('s.createdAt', 'DESC')
            ->willReturnSelf();

        $this->makeExtension($security)->applyToCollection(
            $queryBuilder,
            $this->createMock(QueryNameGeneratorInterface::class),
            Submission::class,
        );
    }
}
