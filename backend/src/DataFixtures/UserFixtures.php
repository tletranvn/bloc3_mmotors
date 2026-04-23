<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture implements FixtureGroupInterface
{
    public const ADMIN_REFERENCE = 'user_admin';

    public function __construct(private UserPasswordHasherInterface $hasher)
    {
    }

    public static function getGroups(): array
    {
        return ['base'];
    }

    public function load(ObjectManager $manager): void
    {
        // Admin
        $admin = new User();
        $admin->setEmail('admin@email.com')
            ->setFirstName('Admin')
            ->setLastName('M-Motors')
            ->setPhone('0100000000')
            ->setAddress('1 rue du Siège, 75001 Paris')
            ->setRoles([User::ROLE_ADMIN])
            ->setRgpdConsent(true);
        $admin->setPassword($this->hasher->hashPassword($admin, 'Admin123!'));
        $manager->persist($admin);
        $this->addReference(self::ADMIN_REFERENCE, $admin);

        // Clients
        $clients = [
            ['Marie', 'Dupont', 'marie.dupont@email.com', '0601020304', '12 rue des Lilas, 69001 Lyon'],
            ['Thomas', 'Martin', 'thomas.martin@email.com', '0602030405', '8 avenue Victor Hugo, 33000 Bordeaux'],
            ['Sophie', 'Bernard', 'sophie.bernard@email.com', '0603040506', '25 boulevard Pasteur, 31000 Toulouse'],
            ['Lucas', 'Petit', 'lucas.petit@email.com', '0604050607', '3 place de la République, 44000 Nantes'],
            ['Camille', 'Robert', 'camille.robert@email.com', '0605060708', '17 rue de la Paix, 13001 Marseille'],
        ];

        foreach ($clients as $i => [$firstName, $lastName, $email, $phone, $address]) {
            $user = new User();
            $user->setEmail($email)
                ->setFirstName($firstName)
                ->setLastName($lastName)
                ->setPhone($phone)
                ->setAddress($address)
                ->setRgpdConsent(true);
            $user->setPassword($this->hasher->hashPassword($user, 'Client123!'));
            $manager->persist($user);
            $this->addReference('user_' . $i, $user);
        }

        $manager->flush();
    }
}
