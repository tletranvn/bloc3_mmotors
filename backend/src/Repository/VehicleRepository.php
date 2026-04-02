<?php

namespace App\Repository;

use App\Entity\Vehicle;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

/**
 * @extends ServiceEntityRepository<Vehicle>
 */
class VehicleRepository extends ServiceEntityRepository
{
    public function __construct(
        ManagerRegistry $registry,
        private CacheInterface $cache,
    ) {
        parent::__construct($registry, Vehicle::class);
    }

    /** @return Vehicle[] */
    public function findAvailableVehicles(): array
    {
        return $this->cache->get('vehicles_available', function (ItemInterface $item): array {
            $item->expiresAfter(300);

            return $this->createQueryBuilder('v')
                ->where('v.status = :status')
                ->andWhere('v.deletedAt IS NULL')
                ->setParameter('status', Vehicle::STATUS_AVAILABLE)
                ->orderBy('v.createdAt', 'DESC')
                ->getQuery()
                ->getResult();
        });
    }
}
