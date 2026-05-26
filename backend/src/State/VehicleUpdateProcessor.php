<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Vehicle;
use App\Repository\SubmissionRepository;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class VehicleUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $innerProcessor,
        private SubmissionRepository $submissionRepository,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if ($data instanceof Vehicle) {
            $id = $uriVariables['id'] ?? $data->getId();
            if ($id !== null && $this->submissionRepository->hasActiveSubmissionForVehicleId((int) $id)) {
                throw new ConflictHttpException(
                    'Ce véhicule ne peut pas être modifié car il possède des dossiers en cours (PENDING ou APPROVED).'
                );
            }
        }

        return $this->innerProcessor->process($data, $operation, $uriVariables, $context);
    }
}
