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

        $imageUrls = [
            'https://upload.wikimedia.org/wikipedia/commons/1/1c/Renault_Clio_V_1X7A0392.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/9/9d/Renault_Megane_E-Tech_IAA_2021_1X7A0073.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/2/29/2023_Renault_Captur_RS_Line_TCe.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/b/b0/Peugeot_208_%282022%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/9/9b/2022_-_Peugeot_308_III_%28C%29_-_196.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/2/20/Peugeot_e-3008_Auto_Zuerich_2023_1X7A1014.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/d/d8/Citro%C3%ABn_C3_1.5_BlueHDi_100_%282022%29_%2852917625892%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/3/34/Citro%C3%ABn_e-C4_X_Automesse_Ludwigsburg_2023_1X7A0016.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/f/f9/Citroen_C5_Aircross_Plug-in-Hybrid_IMG_5338.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/b/bf/BMW_1-Series_F52_Shishi_01_2022-06-23.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/b/b3/2021_BMW_3-Series_M340i_xDrive.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/9/91/2021_Mercedes-AMG_A_45_W177.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/f/fc/2022_Mercedes-Benz_C-Class_C220d_Avantgarde.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/a/ae/Volkswagen_Golf_VIII_1X7A0353.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/0/05/Volkswagen_Tiguan_rear.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/e/ed/Tesla_Model_3_%282023%29_1X7A1678.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/1/1c/Tesla_Model_Y_1X7A7391.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/d/d8/Toyota_Yaris_Hybrid_GR_Sport_%28XP210%29_Automesse_Ludwigsburg_2022_1X7A5891.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/5/5f/Toyota_C-HR_hybrid_II_GR_Sport_1X7A1663.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/0/03/Audi_A3_silver_Drammen_9.9.2022.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/9/9d/Audi_Q3_Sportback_IMG_3505.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/c/ca/2023_Renault_Zoe_Handhaving_%2854564687249%29.jpg',
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
                ->setImageUrl($imageUrls[$i]);

            $manager->persist($vehicle);
            $this->addReference('vehicle_' . $i, $vehicle);
        }

        $manager->flush();
    }
}
