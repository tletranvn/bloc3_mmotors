<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Document;
use App\Entity\Submission;
use PHPUnit\Framework\TestCase;

class DocumentTest extends TestCase
{
    private Document $document;

    protected function setUp(): void
    {
        $this->document = new Document();
    }

    public function testConstructorInitializesUploadedAt(): void
    {
        $this->assertInstanceOf(\DateTimeInterface::class, $this->document->getUploadedAt());
    }

    public function testIdNullBeforePersistence(): void
    {
        $this->assertNull($this->document->getId());
    }

    public function testSetGetDocumentType(): void
    {
        $this->document->setDocumentType(Document::TYPE_IDENTITY);
        $this->assertSame(Document::TYPE_IDENTITY, $this->document->getDocumentType());
    }

    public function testSetGetDocumentUrl(): void
    {
        $this->document->setDocumentUrl('https://cloudinary.com/doc.pdf');
        $this->assertSame('https://cloudinary.com/doc.pdf', $this->document->getDocumentUrl());
    }

    public function testSetGetUploadedAt(): void
    {
        $date = new \DateTime('2025-06-01');
        $this->document->setUploadedAt($date);
        $this->assertSame($date, $this->document->getUploadedAt());
    }

    public function testSetGetSubmission(): void
    {
        $submission = new Submission();
        $this->document->setSubmission($submission);
        $this->assertSame($submission, $this->document->getSubmission());
    }

    public function testSubmissionNullable(): void
    {
        $this->document->setSubmission(null);
        $this->assertNull($this->document->getSubmission());
    }
}
