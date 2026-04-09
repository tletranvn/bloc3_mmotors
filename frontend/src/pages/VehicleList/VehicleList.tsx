import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useVehicles } from '../../hooks/useVehicles';
import { useDebounce } from '../../hooks/useDebounce';
import { VehicleCard } from '../../components/features/vehicles/VehicleCard/VehicleCard';
import { Pagination } from '../../components/shared/Pagination/Pagination';
import { VehicleFilters } from '../../components/features/vehicles/VehicleFilters/VehicleFilters';
import type { VehicleFiltersState } from '../../components/features/vehicles/VehicleFilters/VehicleFilters';

function filtersFromParams(params: URLSearchParams): VehicleFiltersState {
  return {
    availabilityType: params.get('availabilityType') ?? '',
    brand: params.get('brand') ?? '',
    fuelType: params.get('fuelType') ?? '',
    maxPrice: Number(params.get('maxPrice') ?? 0),
  };
}

export function VehicleList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<VehicleFiltersState>(() => filtersFromParams(searchParams));
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debouncedFilters = useDebounce(filters, 300);
  const { data, isLoading, isError } = useVehicles(page, debouncedFilters);

  function handleFiltersChange(newFilters: VehicleFiltersState) {
    setFilters(newFilters);
    setPage(1);
    const params: Record<string, string> = {};
    if (newFilters.availabilityType) params['availabilityType'] = newFilters.availabilityType;
    if (newFilters.brand) params['brand'] = newFilters.brand;
    if (newFilters.fuelType) params['fuelType'] = newFilters.fuelType;
    if (newFilters.maxPrice > 0) params['maxPrice'] = String(newFilters.maxPrice);
    setSearchParams(params);
  }

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

  const totalItems = data?.totalItems ?? 0;
  const vehicles = data?.member ?? [];

  return (
    <main className="py-8 px-4 max-w-7xl mx-auto">

      <div className="flex gap-8">

        {/* Sidebar — visible desktop uniquement */}
        <aside className="hidden lg:block w-64 shrink-0">
          <VehicleFilters filters={filters} onChange={handleFiltersChange} />
        </aside>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">

          {/* En-tête : titre + bouton mobile + compteur */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <h1 className="font-display text-3xl font-extrabold text-foreground">
              Nos véhicules
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">
                {totalItems} véhicule{totalItems !== 1 ? 's' : ''} trouvé{totalItems !== 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden px-4 py-2 border border-black/10 rounded text-sm font-medium text-foreground hover:bg-black/5 transition-colors"
              >
                Filtres
              </button>
            </div>
          </div>

          {/* Liste ou message vide */}
          {vehicles.length === 0 ? (
            <p className="text-muted text-center py-12">Aucun véhicule ne correspond à vos critères.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}

          <Pagination
            currentPage={page}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white">
          <div className="flex items-center justify-between px-4 py-4 border-b border-black/8">
            <span className="font-semibold text-foreground">Filtres</span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Fermer les filtres"
              className="text-muted hover:text-foreground transition-colors text-xl leading-none"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <VehicleFilters
              filters={filters}
              onChange={(f) => { handleFiltersChange(f); }}
            />
          </div>
          <div className="px-4 py-4 border-t border-black/8">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="w-full py-3 bg-foreground text-white rounded font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Voir les résultats ({totalItems})
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
