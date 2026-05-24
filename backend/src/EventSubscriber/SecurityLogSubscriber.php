<?php

namespace App\EventSubscriber;

use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationFailureEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class SecurityLogSubscriber implements EventSubscriberInterface
{
    public function __construct(private readonly LoggerInterface $logger) {}

    public static function getSubscribedEvents(): array
    {
        return [
            Events::AUTHENTICATION_SUCCESS => 'onAuthenticationSuccess',
            Events::AUTHENTICATION_FAILURE => 'onAuthenticationFailure',
        ];
    }

    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $user = $event->getUser();
        $userId = method_exists($user, 'getId') ? $user->getId() : null;

        $this->logger->info('authentication_success', [
            'user_id' => $userId,
        ]);
    }

    public function onAuthenticationFailure(AuthenticationFailureEvent $event): void
    {
        $request = $event->getRequest();

        $this->logger->warning('authentication_failure', [
            'ip' => $request?->getClientIp(),
        ]);
    }
}
