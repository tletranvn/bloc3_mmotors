<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Submission;
use App\Entity\Vehicle;
use App\Repository\SubmissionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class VehicleDeleteProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SubmissionRepository $submissionRepository,
        private LoggerInterface $logger,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Vehicle) {
            return null;
        }

        $activeSubmissions = $this->submissionRepository->findBy([
            'vehicle' => $data,
            'status' => [Submission::STATUS_PENDING, Submission::STATUS_APPROVED],
        ]);

        if (count($activeSubmissions) > 0) {
            $this->logger->warning('Vehicle soft-delete bloqué : dossiers actifs', [
                'vehicle_id' => $data->getId(),
                'active_submissions_count' => count($activeSubmissions),
            ]);

            throw new ConflictHttpException('Ce véhicule ne peut pas être supprimé car il est lié à des dossiers actifs (en attente ou validés).');
        }

        $data->setDeletedAt(new \DateTime());
        $this->entityManager->flush();

        $this->logger->info('Vehicle soft-delete effectué', [
            'vehicle_id' => $data->getId(),
        ]);

        return null;
    }
}
