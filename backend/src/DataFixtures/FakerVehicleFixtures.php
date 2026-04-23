<?php

namespace App\DataFixtures;

use App\Entity\Vehicle;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class FakerVehicleFixtures extends Fixture implements FixtureGroupInterface
{
    private const BRANDS_MODELS = [
        'Renault'    => ['Clio', 'Mégane', 'Captur', 'Zoé', 'Scénic', 'Kadjar'],
        'Peugeot'    => ['208', '308', '3008', '5008', '508', '2008'],
        'Citroën'    => ['C3', 'C4', 'C5 Aircross', 'Berlingo'],
        'BMW'        => ['Série 1', 'Série 3', 'Série 5', 'X1', 'X3'],
        'Mercedes'   => ['Classe A', 'Classe C', 'Classe E', 'GLA', 'GLC'],
        'Volkswagen' => ['Golf', 'Polo', 'Tiguan', 'Passat', 'T-Roc'],
        'Tesla'      => ['Model 3', 'Model Y', 'Model S'],
        'Toyota'     => ['Yaris', 'Corolla', 'C-HR', 'RAV4'],
        'Audi'       => ['A3', 'A4', 'A6', 'Q3', 'Q5'],
        'Dacia'      => ['Sandero', 'Duster', 'Spring'],
    ];

    private const COLORS = ['Blanc', 'Noir', 'Gris', 'Bleu', 'Rouge', 'Vert'];

    public static function getGroups(): array
    {
        return ['faker'];
    }

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');

        for ($i = 0; $i < 200; $i++) {
            $brand = $faker->randomElement(array_keys(self::BRANDS_MODELS));
            $model = $faker->randomElement(self::BRANDS_MODELS[$brand]);
            $year = $faker->numberBetween(2018, 2024);
            $mileage = $faker->numberBetween(0, 150000);
            $fuelType = $faker->randomElement([
                Vehicle::FUEL_GASOLINE,
                Vehicle::FUEL_DIESEL,
                Vehicle::FUEL_HYBRID,
                Vehicle::FUEL_ELECTRIC,
            ]);
            $availabilityType = $faker->randomElement([
                Vehicle::AVAILABILITY_SALE,
                Vehicle::AVAILABILITY_RENTAL,
                Vehicle::AVAILABILITY_BOTH,
            ]);
            $color = $faker->randomElement(self::COLORS);

            [$salePrice, $rentalPrice] = $this->generatePrices($faker, $availabilityType);

            $vehicle = new Vehicle();
            $vehicle->setBrand($brand)
                ->setModel($model)
                ->setYear($year)
                ->setMileage($mileage)
                ->setFuelType($fuelType)
                ->setColor($color)
                ->setSalePrice($salePrice)
                ->setRentalPriceMonthly($rentalPrice)
                ->setAvailabilityType($availabilityType)
                ->setDescription("$brand $model $year — $mileage km, " . strtolower($color));

            $manager->persist($vehicle);
        }

        $manager->flush();
    }

    /**
     * @return array{0: ?string, 1: ?string} [salePrice, rentalPriceMonthly]
     */
    private function generatePrices(\Faker\Generator $faker, string $availabilityType): array
    {
        $sale = (string) $faker->numberBetween(8000, 50000);
        $rental = (string) $faker->numberBetween(200, 700);

        return match ($availabilityType) {
            Vehicle::AVAILABILITY_SALE   => [$sale, null],
            Vehicle::AVAILABILITY_RENTAL => [null, $rental],
            Vehicle::AVAILABILITY_BOTH   => [$sale, $rental],
            default                      => [$sale, null],
        };
    }
}
