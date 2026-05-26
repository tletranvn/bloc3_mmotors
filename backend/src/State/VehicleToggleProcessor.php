<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Vehicle;
use App\Service\VehicleService;
use Doctrine\ORM\EntityManagerInterface;

class VehicleToggleProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly VehicleService $vehicleService,
        private readonly EntityManagerInterface $entityManager,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Vehicle
    {
        $this->vehicleService->toggleAvailability($data);
        $this->entityManager->flush();

        return $data;
    }
}
