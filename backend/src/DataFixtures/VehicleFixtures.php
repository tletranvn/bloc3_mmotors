<?php

namespace App\DataFixtures;

use App\Entity\Vehicle;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class VehicleFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $vehicles = [
            ['Renault', 'Clio', 2022, 25000, Vehicle::FUEL_GASOLINE, 'Rouge', '14500', null, Vehicle::AVAILABILITY_SALE],
            ['Renault', 'Mégane', 2021, 45000, Vehicle::FUEL_DIESEL, 'Gris', '18900', null, Vehicle::AVAILABILITY_SALE],
            ['Renault', 'Captur', 2023, 12000, Vehicle::FUEL_HYBRID, 'Blanc', '24500', '350', Vehicle::AVAILABILITY_BOTH],
            ['Peugeot', '208', 2022, 30000, Vehicle::FUEL_GASOLINE, 'Bleu', '15200', null, Vehicle::AVAILABILITY_SALE],
            ['Peugeot', '308', 2021, 55000, Vehicle::FUEL_DIESEL, 'Noir', '19800', '320', Vehicle::AVAILABILITY_BOTH],
            ['Peugeot', '3008', 2023, 18000, Vehicle::FUEL_HYBRID, 'Gris', '32000', '450', Vehicle::AVAILABILITY_BOTH],
            ['Citroën', 'C3', 2022, 28000, Vehicle::FUEL_GASOLINE, 'Blanc', '13500', null, Vehicle::AVAILABILITY_SALE],
            ['Citroën', 'C4', 2023, 15000, Vehicle::FUEL_ELECTRIC, 'Bleu', '28000', '380', Vehicle::AVAILABILITY_BOTH],
            ['Citroën', 'C5 Aircross', 2021, 40000, Vehicle::FUEL_DIESEL, 'Gris', '26500', '420', Vehicle::AVAILABILITY_BOTH],
            ['BMW', 'Série 1', 2022, 22000, Vehicle::FUEL_GASOLINE, 'Noir', '28500', '400', Vehicle::AVAILABILITY_BOTH],
            ['BMW', 'Série 3', 2021, 35000, Vehicle::FUEL_DIESEL, 'Blanc', '35000', '500', Vehicle::AVAILABILITY_BOTH],
            ['Mercedes', 'Classe A', 2023, 10000, Vehicle::FUEL_HYBRID, 'Gris', '33000', '480', Vehicle::AVAILABILITY_BOTH],
            ['Mercedes', 'Classe C', 2022, 28000, Vehicle::FUEL_DIESEL, 'Noir', '38000', '550', Vehicle::AVAILABILITY_BOTH],
            ['Volkswagen', 'Golf', 2022, 32000, Vehicle::FUEL_GASOLINE, 'Gris', '22000', '330', Vehicle::AVAILABILITY_BOTH],
            ['Volkswagen', 'Tiguan', 2021, 45000, Vehicle::FUEL_DIESEL, 'Blanc', '29000', '430', Vehicle::AVAILABILITY_BOTH],
            ['Tesla', 'Model 3', 2023, 8000, Vehicle::FUEL_ELECTRIC, 'Blanc', '42000', '550', Vehicle::AVAILABILITY_BOTH],
            ['Tesla', 'Model Y', 2023, 5000, Vehicle::FUEL_ELECTRIC, 'Rouge', '52000', '600', Vehicle::AVAILABILITY_BOTH],
            ['Toyota', 'Yaris', 2022, 20000, Vehicle::FUEL_HYBRID, 'Bleu', '16500', '250', Vehicle::AVAILABILITY_BOTH],
            ['Toyota', 'C-HR', 2023, 12000, Vehicle::FUEL_HYBRID, 'Noir', '27000', '380', Vehicle::AVAILABILITY_BOTH],
            ['Audi', 'A3', 2022, 25000, Vehicle::FUEL_GASOLINE, 'Gris', '27500', '400', Vehicle::AVAILABILITY_BOTH],
            ['Audi', 'Q3', 2021, 38000, Vehicle::FUEL_DIESEL, 'Blanc', '31000', '450', Vehicle::AVAILABILITY_BOTH],
            ['Renault', 'Zoé', 2023, 15000, Vehicle::FUEL_ELECTRIC, 'Bleu', '21000', '210', Vehicle::AVAILABILITY_RENTAL],
        ];

        foreach ($vehicles as $i => [$brand, $model, $year, $mileage, $fuel, $color, $sale, $rental, $availability]) {
            $vehicle = new Vehicle();
            $vehicle->setBrand($brand)
                ->setModel($model)
                ->setYear($year)
                ->setMileage($mileage)
                ->setFuelType($fuel)
                ->setColor($color)
                ->setSalePrice($sale)
                ->setRentalPriceMonthly($rental)
                ->setAvailabilityType($availability)
                ->setDescription("$brand $model $year — $mileage km, " . strtolower($color))
                ->setImageUrl('https://placehold.co/600x400?text=' . urlencode("$brand $model"));

            $manager->persist($vehicle);
            $this->addReference('vehicle_' . $i, $vehicle);
        }

        $manager->flush();
    }
}
