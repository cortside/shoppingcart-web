import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '@/pages/Catalog/components/Pagination';

describe('Pagination', () => {
  it('should render current page and total pages', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        totalItems={50}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('should render previous and next buttons', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        totalItems={50}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalItems={50}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={5}
        totalItems={50}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('should call onPageChange with previous page when previous is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={3}
        totalItems={50}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );

    await user.click(screen.getByLabelText('Previous page'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange with next page when next is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={3}
        totalItems={50}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );

    await user.click(screen.getByLabelText('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('should not render when only one page', () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <Pagination
        currentPage={1}
        totalItems={5}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should calculate total pages correctly', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalItems={25}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });
});
