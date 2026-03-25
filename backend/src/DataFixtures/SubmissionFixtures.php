<?php

namespace App\DataFixtures;

use App\Entity\Submission;
use App\Entity\User;
use App\Entity\Vehicle;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class SubmissionFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $submissions = [
            // [user_ref, vehicle_ref, type, status, profession, monthlyIncome, duration, annualKm, rejectionReason]
            ['user_0', 'vehicle_0', Submission::TYPE_SALE, Submission::STATUS_PENDING, 'Infirmière', '2800', null, null, null],
            ['user_0', 'vehicle_15', Submission::TYPE_RENTAL, Submission::STATUS_APPROVED, 'Infirmière', '2800', 36, 15000, null],
            ['user_1', 'vehicle_3', Submission::TYPE_SALE, Submission::STATUS_PENDING, 'Développeur', '3500', null, null, null],
            ['user_1', 'vehicle_10', Submission::TYPE_RENTAL, Submission::STATUS_REJECTED, 'Développeur', '3500', 48, 20000, 'Revenus insuffisants pour ce véhicule'],
            ['user_2', 'vehicle_5', Submission::TYPE_SALE, Submission::STATUS_APPROVED, 'Architecte', '4200', null, null, null],
            ['user_3', 'vehicle_17', Submission::TYPE_RENTAL, Submission::STATUS_PENDING, 'Comptable', '3000', 24, 12000, null],
            ['user_4', 'vehicle_11', Submission::TYPE_RENTAL, Submission::STATUS_APPROVED, 'Avocate', '5000', 36, 18000, null],
        ];

        foreach ($submissions as [$userRef, $vehicleRef, $type, $status, $profession, $income, $duration, $annualKm, $reason]) {
            $submission = new Submission();
            /** @var User $user */
            $user = $this->getReference($userRef, User::class);
            /** @var Vehicle $vehicle */
            $vehicle = $this->getReference($vehicleRef, Vehicle::class);

            $submission->setClient($user)
                ->setVehicle($vehicle)
                ->setType($type)
                ->setStatus($status)
                ->setProfession($profession)
                ->setMonthlyIncome($income)
                ->setDuration($duration)
                ->setAnnualKm($annualKm)
                ->setRejectionReason($reason);

            $manager->persist($submission);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            VehicleFixtures::class,
        ];
    }
}
