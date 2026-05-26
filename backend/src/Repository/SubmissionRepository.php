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
        return $vehicle->getId() !== null && $this->hasActiveSubmissionForVehicleId($vehicle->getId());
    }

    public function hasActiveSubmissionForVehicleId(int $vehicleId): bool
    {
        return (int) $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->where('IDENTITY(s.vehicle) = :vehicleId')
            ->andWhere('s.status IN (:statuses)')
            ->setParameter('vehicleId', $vehicleId)
            ->setParameter('statuses', [Submission::STATUS_PENDING, Submission::STATUS_APPROVED])
            ->getQuery()
            ->getSingleScalarResult() > 0;
    }
}
