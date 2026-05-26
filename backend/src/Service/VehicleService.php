<?php

namespace App\Service;

use App\Entity\Vehicle;
use App\Repository\SubmissionRepository;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class VehicleService
{
    public function __construct(private readonly SubmissionRepository $submissionRepository) {}

    public function toggleAvailability(Vehicle $vehicle): void
    {
        if ($this->submissionRepository->hasActiveSubmissionForVehicle($vehicle)) {
            throw new ConflictHttpException(
                'Impossible de basculer : un dossier est en cours (PENDING ou APPROVED).'
            );
        }

        $newType = match ($vehicle->getAvailabilityType()) {
            Vehicle::AVAILABILITY_SALE, Vehicle::AVAILABILITY_BOTH => Vehicle::AVAILABILITY_RENTAL,
            default => Vehicle::AVAILABILITY_SALE,
        };

        if ($newType === Vehicle::AVAILABILITY_RENTAL && $vehicle->getRentalPriceMonthly() === null) {
            throw new UnprocessableEntityHttpException(
                'Le loyer mensuel doit être défini avant de basculer en Location.'
            );
        }

        if ($newType === Vehicle::AVAILABILITY_SALE && $vehicle->getSalePrice() === null) {
            throw new UnprocessableEntityHttpException(
                'Le prix de vente doit être défini avant de basculer en Vente.'
            );
        }

        $vehicle->setAvailabilityType($newType);
    }
}
