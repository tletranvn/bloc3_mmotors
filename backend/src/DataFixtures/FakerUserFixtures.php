<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class FakerUserFixtures extends Fixture implements FixtureGroupInterface
{
    public function __construct(private UserPasswordHasherInterface $hasher)
    {
    }

    public static function getGroups(): array
    {
        return ['faker'];
    }

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');

        for ($i = 0; $i < 100; $i++) {
            $user = new User();
            $user->setEmail($faker->unique()->email())
                ->setFirstName($faker->firstName())
                ->setLastName($faker->lastName())
                ->setPhone($this->fakePhoneFr($faker))
                ->setAddress($faker->streetAddress() . ', ' . $faker->postcode() . ' ' . $faker->city())
                ->setRgpdConsent(true);
            $user->setPassword($this->hasher->hashPassword($user, 'Client123!'));

            $manager->persist($user);
        }

        $manager->flush();
    }

    /**
     * L'entite User exige un telephone francais au format 06XXXXXXXX ou 07XXXXXXXX.
     * Faker->phoneNumber() renvoie parfois des formats avec espaces — on genere a la main.
     */
    private function fakePhoneFr(\Faker\Generator $faker): string
    {
        $prefix = $faker->randomElement(['06', '07']);

        return $prefix . $faker->numerify('########');
    }
}
