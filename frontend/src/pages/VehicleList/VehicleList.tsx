import { useVehicles } from '../../hooks/useVehicles';
import { VehicleCard } from '../../components/features/vehicles/VehicleCard/VehicleCard';
import { useState } from 'react';
import { Pagination } from '../../components/shared/Pagination/Pagination';

export function VehicleList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useVehicles(page);

  if (isLoading) {
    return (
      <div className="py-8 px-4 max-w-7xl mx-auto">
        <p className="text-muted text-center">Chargement des véhicules...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="py-8 px-4 max-w-7xl mx-auto">
        <p className="text-red-600 text-center">Une erreur est survenue. Veuillez réessayer.</p>
      </div>
    );
  }

  if (!data || data.member.length === 0) {
    return (
      <div className="py-8 px-4 max-w-7xl mx-auto">
        <p className="text-muted text-center">Aucun véhicule disponible.</p>
      </div>
    );
  }

  return (
    <main className="py-8 px-4 max-w-7xl mx-auto">
      <h1 className="font-display text-3xl font-extrabold text-foreground mb-8">
        Nos véhicules
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.member.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalItems={data.totalItems}
        onPageChange={setPage}
      />
    </main>
  );
}
