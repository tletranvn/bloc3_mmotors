<?php

namespace App\Controller;

use App\Entity\Document;
use App\Entity\Submission;
use App\Service\CloudinaryService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;

class DocumentUploadController extends AbstractController
{
    private const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

    public function __construct(
        private CloudinaryService $cloudinaryService,
        private EntityManagerInterface $entityManager,
        private Security $security,
        private LoggerInterface $logger,
    ) {
    }

    #[Route('/api/submissions/{id}/documents', name: 'submission_document_upload', methods: ['POST'])]
    public function upload(int $id, Request $request): JsonResponse
    {
        $submission = $this->entityManager->find(Submission::class, $id);

        // Dossier inexistant ou appartenant a un autre client : meme reponse 404
        // pour ne pas reveler l'existence d'un dossier (anti-enumeration, DT-004).
        if ($submission === null || $submission->getClient() !== $this->security->getUser()) {
            $this->logger->warning('document_upload_denied', [
                'user_id'       => $this->security->getUser()?->getId(),
                'submission_id' => $id,
            ]);

            throw new NotFoundHttpException('Dossier introuvable.');
        }

        $file = $request->files->get('file');
        $documentType = $request->request->get('documentType');

        if ($file === null) {
            throw new BadRequestHttpException('Aucun fichier envoyé.');
        }

        if (!in_array($documentType, [Document::TYPE_IDENTITY, Document::TYPE_ADDRESS, Document::TYPE_RIB, Document::TYPE_PAYSLIP], true)) {
            throw new BadRequestHttpException('Type de document invalide.');
        }

        if (!in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES, true)) {
            throw new BadRequestHttpException('Format non autorisé. PDF, JPG ou PNG uniquement.');
        }

        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new BadRequestHttpException('Fichier trop lourd. Maximum 5 Mo.');
        }

        $user = $this->security->getUser();
        $publicId = sprintf('%s_%s_%s', $user->getId(), time(), strtolower($documentType));

        $url = $this->cloudinaryService->upload($file->getPathname(), 'documents/' . $publicId);

        $document = new Document();
        $document->setDocumentType($documentType);
        $document->setDocumentUrl($url);
        $document->setSubmission($submission);

        $this->entityManager->persist($document);
        $this->entityManager->flush();

        return $this->json([
            'id'           => $document->getId(),
            'documentType' => $document->getDocumentType(),
            'documentUrl'  => $document->getDocumentUrl(),
            'uploadedAt'   => $document->getUploadedAt()?->format(\DateTimeInterface::ATOM),
        ], Response::HTTP_CREATED);
    }
}
