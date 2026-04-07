import { FUEL_TYPE_LABELS } from '../../constants/labels';
import type { Vehicle } from '../../services/api/vehicleService';

type Props = {
  vehicle: Vehicle;
};

export default function VehicleSpecs({ vehicle }: Props) {
  return (
    <table className="w-full text-sm">
      <tbody>
        <tr className="border-b">
          <td className="py-2 text-gray-500">Année</td>
          <td className="py-2 font-medium">{vehicle.year}</td>
        </tr>
        <tr className="border-b">
          <td className="py-2 text-gray-500">Kilométrage</td>
          <td className="py-2 font-medium">{vehicle.mileage.toLocaleString('fr-FR')} km</td>
        </tr>
        <tr className="border-b">
          <td className="py-2 text-gray-500">Motorisation</td>
          <td className="py-2 font-medium">{FUEL_TYPE_LABELS[vehicle.fuelType] ?? vehicle.fuelType}</td>
        </tr>
        <tr>
          <td className="py-2 text-gray-500">Couleur</td>
          <td className="py-2 font-medium">{vehicle.color ?? '—'}</td>
        </tr>
      </tbody>
    </table>
  );
}
