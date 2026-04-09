<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260409090427 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE INDEX idx_vehicle_availability_type ON vehicle (availability_type)');
        $this->addSql('CREATE INDEX idx_vehicle_brand ON vehicle (brand)');
        $this->addSql('CREATE INDEX idx_vehicle_fuel_type ON vehicle (fuel_type)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX idx_vehicle_availability_type');
        $this->addSql('DROP INDEX idx_vehicle_brand');
        $this->addSql('DROP INDEX idx_vehicle_fuel_type');
    }
}
