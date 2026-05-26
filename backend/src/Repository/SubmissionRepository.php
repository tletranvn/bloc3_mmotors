<?php

namespace App\Repository;

use App\Entity\Submission;
use App\Entity\Vehicle;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Submission>
 */
class SubmissionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Submission::class);
    }

    public function hasActiveSubmissionForVehicle(Vehicle $vehicle): bool
    {
        return (int) $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->where('s.vehicle = :vehicle')
            ->andWhere('s.status IN (:statuses)')
            ->setParameter('vehicle', $vehicle)
            ->setParameter('statuses', [Submission::STATUS_PENDING, Submission::STATUS_APPROVED])
            ->getQuery()
            ->getSingleScalarResult() > 0;
    }
}
