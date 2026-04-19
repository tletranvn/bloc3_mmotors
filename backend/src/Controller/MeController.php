<?php

namespace App\Controller;

use App\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;

class MeController
{
    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function __invoke(
        #[CurrentUser] User $user,
        SerializerInterface $serializer
    ): JsonResponse {
        $data = json_decode($serializer->serialize($user, 'json', ['groups' => ['user:read']]), true);

        return new JsonResponse($data);
    }
}
