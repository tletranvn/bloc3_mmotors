import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { register, type RegisterData } from './authService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

const validData: RegisterData = {
  email: 'jean.dupont@email.com',
  plainPassword: 'Secure1234!',
  firstName: 'Jean',
  lastName: 'Dupont',
  phone: '0612345678',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('register', () => {
  it('envoie un POST /api/register avec les données utilisateur', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: { id: 1, email: validData.email, firstName: 'Jean', lastName: 'Dupont', phone: '0612345678' },
    });

    await register(validData);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/register'),
      validData
    );
  });

  it('retourne le user créé après inscription', async () => {
    const userCreé = { id: 1, email: validData.email, firstName: 'Jean', lastName: 'Dupont', phone: '0612345678' };
    mockedAxios.post = vi.fn().mockResolvedValue({ data: userCreé });

    const result = await register(validData);

    expect(result).toEqual(userCreé);
  });

  it('propage une erreur si email déjà existant (422)', async () => {
    mockedAxios.post = vi.fn().mockRejectedValue({
      response: { status: 422, data: { detail: 'Cet email est déjà utilisé.' } },
    });

    await expect(register(validData)).rejects.toMatchObject({
      response: { status: 422 },
    });
  });
});
