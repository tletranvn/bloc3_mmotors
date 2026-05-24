<?php

namespace App\Tests\Unit\EventSubscriber;

use App\Entity\User;
use App\EventSubscriber\SecurityLogSubscriber;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationFailureEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

class SecurityLogSubscriberTest extends TestCase
{
    private LoggerInterface $logger;
    private SecurityLogSubscriber $subscriber;

    protected function setUp(): void
    {
        $this->logger     = $this->createMock(LoggerInterface::class);
        $this->subscriber = new SecurityLogSubscriber($this->logger);
    }

    public function testGetSubscribedEventsReturnsBothEvents(): void
    {
        $events = SecurityLogSubscriber::getSubscribedEvents();

        $this->assertArrayHasKey(Events::AUTHENTICATION_SUCCESS, $events);
        $this->assertArrayHasKey(Events::AUTHENTICATION_FAILURE, $events);
    }

    public function testOnAuthenticationSuccessLogsInfoWithUserId(): void
    {
        $user = new User();
        $user->setEmail('client@test.com');

        $event = new AuthenticationSuccessEvent(['token' => 'xxx'], $user, new Response());

        $this->logger->expects($this->once())
            ->method('info')
            ->with('authentication_success', $this->callback(function (array $context) use ($user) {
                return array_key_exists('user_id', $context)
                    && $context['user_id'] === $user->getId()
                    && !array_key_exists('token', $context)
                    && !array_key_exists('email', $context);
            }));

        $this->subscriber->onAuthenticationSuccess($event);
    }

    public function testOnAuthenticationFailureLogsWarningWithIp(): void
    {
        $request = Request::create('/api/login', 'POST', server: ['REMOTE_ADDR' => '192.168.1.1']);
        $event   = new AuthenticationFailureEvent(new AuthenticationException('Bad credentials.'), new Response(), $request);

        $this->logger->expects($this->once())
            ->method('warning')
            ->with('authentication_failure', $this->callback(function (array $context) {
                return array_key_exists('ip', $context)
                    && !array_key_exists('email', $context)
                    && !array_key_exists('password', $context);
            }));

        $this->subscriber->onAuthenticationFailure($event);
    }

    public function testOnAuthenticationFailureWithNullRequestDoesNotCrash(): void
    {
        $event = new AuthenticationFailureEvent(new AuthenticationException('Bad credentials.'), new Response(), null);

        $this->logger->expects($this->once())
            ->method('warning')
            ->with('authentication_failure', ['ip' => null]);

        $this->subscriber->onAuthenticationFailure($event);
    }
}
