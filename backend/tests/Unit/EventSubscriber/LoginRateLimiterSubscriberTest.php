<?php

namespace App\Tests\Unit\EventSubscriber;

use App\EventSubscriber\LoginRateLimiterSubscriber;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\RateLimiter\LimiterInterface;
use Symfony\Component\RateLimiter\RateLimit;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;

class LoginRateLimiterSubscriberTest extends TestCase
{
    private RateLimiterFactoryInterface $factory;
    private LoggerInterface $logger;
    private LoginRateLimiterSubscriber $subscriber;

    protected function setUp(): void
    {
        $this->factory    = $this->createMock(RateLimiterFactoryInterface::class);
        $this->logger     = $this->createMock(LoggerInterface::class);
        $this->subscriber = new LoginRateLimiterSubscriber($this->factory, $this->logger);
    }

    public function testGetSubscribedEventsListensToKernelRequest(): void
    {
        $events = LoginRateLimiterSubscriber::getSubscribedEvents();

        $this->assertArrayHasKey(KernelEvents::REQUEST, $events);
    }

    public function testSixthAttemptFromSameIpThrowsTooManyRequests(): void
    {
        $event = $this->createRequestEvent('/api/login', 'POST', '192.168.1.1');

        $limit   = $this->createMock(RateLimit::class);
        $limit->method('isAccepted')->willReturn(false);
        $limiter = $this->createMock(LimiterInterface::class);
        $limiter->method('consume')->with(1)->willReturn($limit);
        $this->factory->method('create')->with('192.168.1.1')->willReturn($limiter);

        $this->logger->expects($this->once())
            ->method('warning')
            ->with('login_rate_limit_exceeded', $this->callback(function (array $context) {
                return $context['ip'] === '192.168.1.1'
                    && !array_key_exists('email', $context)
                    && !array_key_exists('password', $context);
            }));

        $this->expectException(TooManyRequestsHttpException::class);

        $this->subscriber->onKernelRequest($event);
    }

    public function testAttemptWithinLimitDoesNotThrow(): void
    {
        $event = $this->createRequestEvent('/api/login', 'POST', '192.168.1.1');

        $limit   = $this->createMock(RateLimit::class);
        $limit->method('isAccepted')->willReturn(true);
        $limiter = $this->createMock(LimiterInterface::class);
        $limiter->method('consume')->with(1)->willReturn($limit);
        $this->factory->method('create')->willReturn($limiter);

        $this->subscriber->onKernelRequest($event);

        $this->addToAssertionCount(1);
    }

    public function testNonLoginPathIsIgnored(): void
    {
        $event = $this->createRequestEvent('/api/vehicles', 'POST', '192.168.1.1');

        $this->factory->expects($this->never())->method('create');

        $this->subscriber->onKernelRequest($event);
    }

    public function testNonPostMethodIsIgnored(): void
    {
        $event = $this->createRequestEvent('/api/login', 'GET', '192.168.1.1');

        $this->factory->expects($this->never())->method('create');

        $this->subscriber->onKernelRequest($event);
    }

    public function testSubRequestIsIgnored(): void
    {
        $request = Request::create('/api/login', 'POST', server: ['REMOTE_ADDR' => '192.168.1.1']);
        $event   = new RequestEvent(
            $this->createMock(HttpKernelInterface::class),
            $request,
            HttpKernelInterface::SUB_REQUEST,
        );

        $this->factory->expects($this->never())->method('create');

        $this->subscriber->onKernelRequest($event);
    }

    private function createRequestEvent(string $path, string $method, string $ip): RequestEvent
    {
        $request = Request::create($path, $method, server: ['REMOTE_ADDR' => $ip]);

        return new RequestEvent(
            $this->createMock(HttpKernelInterface::class),
            $request,
            HttpKernelInterface::MAIN_REQUEST,
        );
    }
}
