<?php

namespace App\Service;

use Cloudinary\Cloudinary;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Configuration\Configuration;

class CloudinaryService
{
    private Cloudinary $cloudinary;

    public function __construct(
        private string $cloudName,
        private string $apiKey,
        private string $apiSecret,
        ?Cloudinary $cloudinary = null,
    ) {
        $this->cloudinary = $cloudinary ?? new Cloudinary(
            Configuration::instance([
                'cloud' => [
                    'cloud_name' => $cloudName,
                    'api_key'    => $apiKey,
                    'api_secret' => $apiSecret,
                ],
                'url' => ['secure' => true],
            ])
        );
    }

    /**
     * Upload a file to Cloudinary and return the secure URL.
     *
     * @param string $filePath  Absolute path to the local file
     * @param string $folder    Cloudinary folder (e.g. "vehicles")
     * @return string           Secure URL of the uploaded resource
     * @throws \RuntimeException on upload failure
     */
    public function upload(string $filePath, string $folder = 'vehicles'): string
    {
        $result = $this->cloudinary->uploadApi()->upload($filePath, [
            'folder' => $folder,
            'resource_type' => 'auto',
        ]);

        if (empty($result['secure_url'])) {
            throw new \RuntimeException('Cloudinary upload failed: no secure_url returned.');
        }

        return $result['secure_url'];
    }

    /**
     * Delete a resource from Cloudinary by its public_id.
     *
     * @param string $publicId  e.g. "vehicles/abc123"
     */
    public function delete(string $publicId): void
    {
        $this->cloudinary->uploadApi()->destroy($publicId);
    }

    /**
     * Extract the public_id from a Cloudinary secure URL.
     * e.g. https://res.cloudinary.com/cloud/image/upload/v123/vehicles/abc.jpg → vehicles/abc
     */
    public function extractPublicId(string $secureUrl): string
    {
        $path = parse_url($secureUrl, PHP_URL_PATH);
        // Remove /image/upload/vXXXXXXXX/ prefix
        $path = preg_replace('#^/[^/]+/[^/]+/upload/v\d+/#', '', $path);
        // Remove file extension
        return preg_replace('/\.[^.]+$/', '', $path);
    }
}
