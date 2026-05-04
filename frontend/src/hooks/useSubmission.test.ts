import { describe, it, expect, vi } from 'vitest';
import * as reactQuery from '@tanstack/react-query';
import { useSubmission } from './useSubmission';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({ data: undefined, isLoading: false, isError: false }),
}));

vi.mock('./useAuth', () => ({
  useAuth: () => ({ token: 'fake-token' }),
}));

describe('useSubmission', () => {
  it('appelle useQuery avec la queryKey ["submission", id]', () => {
    useSubmission(30);
    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['submission', 30] })
    );
  });

  it('appelle useQuery avec un id différent', () => {
    useSubmission(42);
    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['submission', 42] })
    );
  });
});
