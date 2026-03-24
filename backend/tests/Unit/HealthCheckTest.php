<?php

namespace App\Tests\Unit;

use PHPUnit\Framework\TestCase;

class HealthCheckTest extends TestCase
{
    public function testPhpUnitIsWorking(): void
    {
        $this->assertTrue(true);
    }

    public function testPhpVersionIsCompatible(): void
    {
        $this->assertGreaterThanOrEqual('8.2', PHP_VERSION);
    }

    public function testAssertionsWork(): void
    {
        $this->assertEquals(4, 2 + 2);
        $this->assertNotEmpty('bloc3_mmotors');
        $this->assertIsString('test');
    }
}
