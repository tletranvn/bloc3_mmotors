<?php

namespace App\Security\Voter;

use App\Entity\Submission;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class SubmissionVoter extends Voter
{
    public const VIEW = 'SUBMISSION_VIEW';
    public const EDIT = 'SUBMISSION_EDIT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::VIEW, self::EDIT])
            && $subject instanceof Submission;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }

        /** @var Submission $submission */
        $submission = $subject;

        return match ($attribute) {
            self::VIEW => $submission->getClient() === $user,
            self::EDIT => false,
            default    => false,
        };
    }
}
