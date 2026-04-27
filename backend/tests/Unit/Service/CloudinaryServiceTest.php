<?php

namespace App\Tests\Unit\Service;

use App\Service\CloudinaryService;
use Cloudinary\Cloudinary;
use Cloudinary\Api\Upload\UploadApi;
use PHPUnit\Framework\TestCase;

class CloudinaryServiceTest extends TestCase
{
    private function makeService(?Cloudinary $cloudinary = null): CloudinaryService
    {
        return new CloudinaryService('test-cloud', 'test-key', 'test-secret', $cloudinary);
    }

    private function mockCloudinaryWithUploadApi(UploadApi $uploadApi): Cloudinary
    {
        $cloudinary = $this->createMock(Cloudinary::class);
        $cloudinary->method('uploadApi')->willReturn($uploadApi);
        return $cloudinary;
    }

    // --- upload() ---

    public function testUploadReturnsSecureUrl(): void
    {
        $uploadApi = $this->createMock(UploadApi::class);
        $uploadApi->method('upload')->willReturn([
            'secure_url' => 'https://res.cloudinary.com/test/image/upload/v123/vehicles/car.jpg',
            'public_id'  => 'vehicles/car',
        ]);

        $service = $this->makeService($this->mockCloudinaryWithUploadApi($uploadApi));

        $url = $service->upload('/tmp/car.jpg', 'vehicles');

        $this->assertSame(
            'https://res.cloudinary.com/test/image/upload/v123/vehicles/car.jpg',
            $url
        );
    }

    public function testUploadThrowsWhenNoSecureUrl(): void
    {
        $uploadApi = $this->createMock(UploadApi::class);
        $uploadApi->method('upload')->willReturn([]);

        $service = $this->makeService($this->mockCloudinaryWithUploadApi($uploadApi));

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessageMatches('/Cloudinary upload failed/');

        $service->upload('/tmp/car.jpg');
    }

    public function testUploadUsesDefaultFolderVehicles(): void
    {
        $uploadApi = $this->createMock(UploadApi::class);
        $uploadApi->expects($this->once())
            ->method('upload')
            ->with('/tmp/photo.jpg', $this->arrayHasKey('folder'))
            ->willReturn(['secure_url' => 'https://res.cloudinary.com/test/image/upload/v1/vehicles/photo.jpg']);

        $service = $this->makeService($this->mockCloudinaryWithUploadApi($uploadApi));
        $service->upload('/tmp/photo.jpg');
    }

    // --- delete() ---

    public function testDeleteCallsDestroy(): void
    {
        $uploadApi = $this->createMock(UploadApi::class);
        $uploadApi->expects($this->once())
            ->method('destroy')
            ->with('vehicles/car');

        $service = $this->makeService($this->mockCloudinaryWithUploadApi($uploadApi));
        $service->delete('vehicles/car');
    }

    // --- extractPublicId() ---

    public function testExtractPublicIdRemovesVersionAndExtension(): void
    {
        $url = 'https://res.cloudinary.com/dunb0wzvm/image/upload/v1234567890/vehicles/abc123.jpg';
        $this->assertSame('vehicles/abc123', $this->makeService()->extractPublicId($url));
    }

    public function testExtractPublicIdWorksWithPngExtension(): void
    {
        $url = 'https://res.cloudinary.com/dunb0wzvm/image/upload/v9999999999/vehicles/xyz.png';
        $this->assertSame('vehicles/xyz', $this->makeService()->extractPublicId($url));
    }

    public function testExtractPublicIdWorksWithNestedFolder(): void
    {
        $url = 'https://res.cloudinary.com/dunb0wzvm/image/upload/v1000000000/vehicles/2024/photo.webp';
        $this->assertSame('vehicles/2024/photo', $this->makeService()->extractPublicId($url));
    }
}
