<?php

namespace App\Tests\Unit\Controller;

use App\Controller\HealthController;
use Doctrine\DBAL\Connection;
use PHPUnit\Framework\TestCase;
use Psr\Container\ContainerInterface;
use Symfony\Component\HttpFoundation\Response;

class HealthControllerTest extends TestCase
{
    private function makeController(): HealthController
    {
        $controller = new HealthController();

        // json() de AbstractController interroge le container : pas de serializer
        // ici, donc il retombe sur un JsonResponse simple.
        $container = $this->createMock(ContainerInterface::class);
        $container->method('has')->willReturn(false);
        $controller->setContainer($container);

        return $controller;
    }

    public function testReturnsOkWhenDatabaseReachable(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())->method('executeQuery')->with('SELECT 1');

        $response = $this->makeController()->__invoke($connection);

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertSame(['status' => 'ok', 'db' => 'ok'], json_decode($response->getContent(), true));
    }

    public function testReturnsServiceUnavailableWhenDatabaseFails(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->method('executeQuery')->willThrowException(new \RuntimeException('DB down'));

        $response = $this->makeController()->__invoke($connection);

        $this->assertSame(Response::HTTP_SERVICE_UNAVAILABLE, $response->getStatusCode());
        $this->assertSame(['status' => 'error', 'db' => 'error'], json_decode($response->getContent(), true));
    }
}
