<?php

namespace App\Tests\Unit\Controller;

use App\Controller\DocumentUploadController;
use App\Entity\Document;
use App\Entity\Submission;
use App\Entity\User;
use App\Service\CloudinaryService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Psr\Container\ContainerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class DocumentUploadControllerTest extends TestCase
{
    private string $pngPath;
    private string $txtPath;

    protected function setUp(): void
    {
        // Un vrai PNG minimal (1x1) pour que getMimeType() retourne image/png.
        $this->pngPath = sys_get_temp_dir() . '/upload_test.png';
        file_put_contents($this->pngPath, base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQAY3Y2wAAAAAElFTkSuQmCC'
        ));

        $this->txtPath = sys_get_temp_dir() . '/upload_test.txt';
        file_put_contents($this->txtPath, 'fichier texte non autorise');
    }

    protected function tearDown(): void
    {
        @unlink($this->pngPath);
        @unlink($this->txtPath);
    }

    public function testUploadOnUnknownSubmissionReturnsNotFound(): void
    {
        $controller = $this->createController(null, $this->createMock(Security::class));

        $this->expectException(NotFoundHttpException::class);
        $this->expectExceptionMessage('Dossier introuvable.');

        $controller->upload(999, new Request());
    }

    public function testUploadOnSubmissionOwnedByAnotherUserReturnsNotFound(): void
    {
        $submission = $this->submissionOwnedBy(new User());

        $controller = $this->createController($submission, $this->securityFor(new User()));

        $this->expectException(NotFoundHttpException::class);
        $this->expectExceptionMessage('Dossier introuvable.');

        $controller->upload(1, new Request());
    }

    public function testUploadWithoutFileReturnsBadRequest(): void
    {
        $owner      = new User();
        $controller = $this->createController($this->submissionOwnedBy($owner), $this->securityFor($owner));

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Aucun fichier envoyé.');

        $controller->upload(1, new Request());
    }

    public function testUploadWithInvalidDocumentTypeReturnsBadRequest(): void
    {
        $owner      = new User();
        $controller = $this->createController($this->submissionOwnedBy($owner), $this->securityFor($owner));

        $request = $this->requestWithFile($this->pngPath, 'INVALID_TYPE');

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Type de document invalide.');

        $controller->upload(1, $request);
    }

    public function testUploadWithDisallowedMimeReturnsBadRequest(): void
    {
        $owner      = new User();
        $controller = $this->createController($this->submissionOwnedBy($owner), $this->securityFor($owner));

        $request = $this->requestWithFile($this->txtPath, Document::TYPE_IDENTITY);

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Format non autorisé. PDF, JPG ou PNG uniquement.');

        $controller->upload(1, $request);
    }

    public function testUploadTooLargeFileReturnsBadRequest(): void
    {
        $largePath = sys_get_temp_dir() . '/upload_large.png';
        file_put_contents($largePath, base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQAY3Y2wAAAAAElFTkSuQmCC'
        ) . str_repeat("\0", 6 * 1024 * 1024));

        $owner      = new User();
        $controller = $this->createController($this->submissionOwnedBy($owner), $this->securityFor($owner));

        $request = $this->requestWithFile($largePath, Document::TYPE_IDENTITY);

        try {
            $this->expectException(BadRequestHttpException::class);
            $this->expectExceptionMessage('Fichier trop lourd. Maximum 5 Mo.');
            $controller->upload(1, $request);
        } finally {
            @unlink($largePath);
        }
    }

    public function testUploadValidFileReturnsCreatedDocument(): void
    {
        $owner = new User();

        $cloudinary = $this->createMock(CloudinaryService::class);
        $cloudinary->expects($this->once())
            ->method('upload')
            ->willReturn('https://res.cloudinary.com/demo/documents/abc.png');

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('find')->willReturn($this->submissionOwnedBy($owner));
        $entityManager->expects($this->once())->method('persist');
        $entityManager->expects($this->once())->method('flush');

        $controller = new DocumentUploadController(
            $cloudinary,
            $entityManager,
            $this->securityFor($owner),
            $this->createMock(LoggerInterface::class),
        );

        // json() de AbstractController interroge le container : pas de serializer
        // ici, donc il retombe sur un JsonResponse simple.
        $container = $this->createMock(ContainerInterface::class);
        $container->method('has')->willReturn(false);
        $controller->setContainer($container);

        $request  = $this->requestWithFile($this->pngPath, Document::TYPE_IDENTITY);
        $response = $controller->upload(1, $request);

        $this->assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        $payload = json_decode($response->getContent(), true);
        $this->assertSame(Document::TYPE_IDENTITY, $payload['documentType']);
        $this->assertSame('https://res.cloudinary.com/demo/documents/abc.png', $payload['documentUrl']);
    }

    private function submissionOwnedBy(User $owner): Submission
    {
        $submission = new Submission();
        $submission->setClient($owner);

        return $submission;
    }

    private function securityFor(?User $user): Security
    {
        $security = $this->createMock(Security::class);
        $security->method('getUser')->willReturn($user);

        return $security;
    }

    private function requestWithFile(string $path, string $documentType): Request
    {
        $file = new UploadedFile($path, basename($path), null, null, true);

        return new Request(
            request: ['documentType' => $documentType],
            files: ['file' => $file],
        );
    }

    private function createController(?Submission $submission, Security $security): DocumentUploadController
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('find')->willReturn($submission);

        return new DocumentUploadController(
            $this->createMock(CloudinaryService::class),
            $entityManager,
            $security,
            $this->createMock(LoggerInterface::class),
        );
    }
}
