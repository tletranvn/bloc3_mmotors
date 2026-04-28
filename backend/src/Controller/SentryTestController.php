<?php

namespace App\Controller;

use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class SentryTestController extends AbstractController
{
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    #[Route(name: 'sentry_test', path: '/_sentry-test')]
    public function testLog(): never
    {
        $this->logger->error('My custom logged error.');
        throw new \RuntimeException('Example exception.');
    }
}
