<?php

namespace App\Tests\Unit\Controller;

use App\Controller\MeController;
use App\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;

class MeControllerTest extends TestCase
{
    public function testInvokeReturnsJsonResponseWithUserData(): void
    {
        $user = new User();
        $user->setEmail('jean@mmotors.fr');
        $user->setFirstName('Jean');
        $user->setLastName('Dupont');

        $userData = [
            'id' => null,
            'email' => 'jean@mmotors.fr',
            'firstName' => 'Jean',
            'lastName' => 'Dupont',
        ];

        $serializer = $this->createMock(SerializerInterface::class);
        $serializer
            ->expects($this->once())
            ->method('serialize')
            ->with($user, 'json', ['groups' => ['user:read']])
            ->willReturn(json_encode($userData));

        $controller = new MeController();
        $response = $controller->__invoke($user, $serializer);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame($userData, json_decode($response->getContent(), true));
    }
}
