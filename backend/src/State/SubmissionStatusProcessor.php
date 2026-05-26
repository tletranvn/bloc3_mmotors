<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Submission;
use App\Entity\Vehicle;
use App\Repository\SubmissionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class SubmissionStatusProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $innerProcessor,
        private SubmissionRepository $submissionRepository,
        private EntityManagerInterface $entityManager,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Submission) {
            return $this->innerProcessor->process($data, $operation, $uriVariables, $context);
        }

        $result = $this->innerProcessor->process($data, $operation, $uriVariables, $context);

        $vehicle = $data->getVehicle();
        if ($vehicle === null) {
            return $result;
        }

        match ($data->getStatus()) {
            Submission::STATUS_APPROVED => $this->handleApproval($data, $vehicle),
            Submission::STATUS_REJECTED => $this->handleRejection($vehicle),
            default => null,
        };

        return $result;
    }

    private function handleApproval(Submission $submission, Vehicle $vehicle): void
    {
        $newStatus = $submission->getType() === Submission::TYPE_RENTAL
            ? Vehicle::STATUS_ON_LEASE
            : Vehicle::STATUS_RESERVED;

        $vehicle->setStatus($newStatus);
        $this->entityManager->flush();
    }

    private function handleRejection(Vehicle $vehicle): void
    {
        if (!$this->submissionRepository->hasActiveSubmissionForVehicle($vehicle)) {
            $vehicle->setStatus(Vehicle::STATUS_AVAILABLE);
            $this->entityManager->flush();
        }
    }
}
