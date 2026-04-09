import { describe, it, expect, vi } from 'vitest';
import * as reactQuery from '@tanstack/react-query';
import { useVehicle } from './useVehicle';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({ data: undefined, isLoading: false, isError: false }),
}));

describe('useVehicle', () => {
  it('appelle useQuery avec la queryKey ["vehicle", id]', () => {
    useVehicle(5);
    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['vehicle', 5] })
    );
  });

  it('appelle useQuery avec un id différent', () => {
    useVehicle(42);
    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['vehicle', 42] })
    );
  });
});
