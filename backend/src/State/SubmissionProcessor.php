<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Submission;
use App\Entity\Vehicle;
use Symfony\Bundle\SecurityBundle\Security;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SubmissionProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $innerProcessor,
        private Security $security,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Submission) {
            return $this->innerProcessor->process($data, $operation, $uriVariables, $context);
        }

        $data->setClient($this->security->getUser());
        $data->setStatus(Submission::STATUS_PENDING);

        $vehicle = $data->getVehicle();

        if ($vehicle === null) {
            throw new BadRequestHttpException('Un véhicule est obligatoire.');
        }

        if ($vehicle->getStatus() !== Vehicle::STATUS_AVAILABLE) {
            throw new UnprocessableEntityHttpException('Ce véhicule n\'est plus disponible.');
        }

        if ($data->getType() === Submission::TYPE_SALE) {
            $availabilityType = $vehicle->getAvailabilityType();
            if ($availabilityType !== Vehicle::AVAILABILITY_SALE && $availabilityType !== Vehicle::AVAILABILITY_BOTH) {
                throw new UnprocessableEntityHttpException('Ce véhicule n\'est pas disponible à la vente.');
            }
        }

        if ($data->getType() === Submission::TYPE_RENTAL) {
            $availabilityType = $vehicle->getAvailabilityType();
            if ($availabilityType !== Vehicle::AVAILABILITY_RENTAL && $availabilityType !== Vehicle::AVAILABILITY_BOTH) {
                throw new UnprocessableEntityHttpException('Ce véhicule n\'est pas disponible à la location.');
            }
        }

        try {
            return $this->innerProcessor->process($data, $operation, $uriVariables, $context);
        } catch (UniqueConstraintViolationException) {
            throw new ConflictHttpException('Vous avez déjà déposé un dossier pour ce véhicule.');
        }
    }
}
