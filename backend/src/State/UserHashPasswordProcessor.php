<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Exécuté avant la sauvegarde d'un User en base.
 * Hash le plainPassword avant le persist.
 */
class UserHashPasswordProcessor implements ProcessorInterface
{
    public function __construct(
        // Préciser quel processor Doctrine (celui qui fait le persist)
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $innerProcessor,
        private UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        // uniquement pour User
        if (!$data instanceof User) {
            return $this->innerProcessor->process($data, $operation, $uriVariables, $context);
        }

        // Si un plainPassword a été envoyé, on le hash
        if ($data->getPlainPassword()) {
            $hashedPassword = $this->passwordHasher->hashPassword($data, $data->getPlainPassword());
            $data->setPassword($hashedPassword);
        }

        // Passer au processor suivant (qui fait le persist en BDD)
        return $this->innerProcessor->process($data, $operation, $uriVariables, $context);
    }
}
