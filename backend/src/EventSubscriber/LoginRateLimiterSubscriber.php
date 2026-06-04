<?php

namespace App\EventSubscriber;

use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;

class LoginRateLimiterSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly RateLimiterFactoryInterface $loginAttemptLimiter,
        private readonly LoggerInterface $logger,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        // Priorite 20 pour passer avant le firewall d'authentification (priorite 8).
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 20],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        if ($request->getPathInfo() !== '/api/login' || !$request->isMethod('POST')) {
            return;
        }

        // Une limite par adresse IP cliente.
        $limiter = $this->loginAttemptLimiter->create($request->getClientIp());

        if (!$limiter->consume(1)->isAccepted()) {
            $this->logger->warning('login_rate_limit_exceeded', [
                'ip' => $request->getClientIp(),
            ]);

            throw new TooManyRequestsHttpException(60, 'Trop de tentatives de connexion. Réessayez dans une minute.');
        }
    }
}
