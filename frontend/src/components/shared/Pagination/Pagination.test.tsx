import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('affiche "Page 1 sur 2" pour 22 items à 12 par page', () => {
    render(<Pagination currentPage={1} totalItems={22} onPageChange={vi.fn()} />);
    expect(screen.getByText('Page 1 sur 2')).toBeInTheDocument();
  });

  it('le bouton Précédent est désactivé sur la page 1', () => {
    render(<Pagination currentPage={1} totalItems={22} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /précédent/i })).toBeDisabled();
  });

  it('le bouton Suivant est désactivé sur la dernière page', () => {
    render(<Pagination currentPage={2} totalItems={22} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /suivant/i })).toBeDisabled();
  });

  it('click Suivant appelle onPageChange(2)', async () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} totalItems={22} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: /suivant/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('click Précédent appelle onPageChange(1)', async () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalItems={22} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: /précédent/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('ne rend rien si totalPages <= 1', () => {
    const { container } = render(<Pagination currentPage={1} totalItems={5} onPageChange={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
