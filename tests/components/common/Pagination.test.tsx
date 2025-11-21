/**
 * Tests for Pagination component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../../../src/components/common/Pagination';

describe('Pagination', () => {
  it('should not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render when totalPages is 0', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render pagination controls when totalPages > 1', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />);

    expect(screen.getByText('← Previous')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Next →')).toBeInTheDocument();
  });

  it('should disable Previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />);

    const prevButton = screen.getByText('← Previous');
    expect(prevButton).toBeDisabled();
  });

  it('should disable Next button on last page', () => {
    render(<Pagination currentPage={3} totalPages={3} onPageChange={vi.fn()} />);

    const nextButton = screen.getByText('Next →');
    expect(nextButton).toBeDisabled();
  });

  it('should enable both buttons on middle page', () => {
    render(<Pagination currentPage={2} totalPages={3} onPageChange={vi.fn()} />);

    const prevButton = screen.getByText('← Previous');
    const nextButton = screen.getByText('Next →');

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('should call onPageChange with previous page when Previous is clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />);

    const prevButton = screen.getByText('← Previous');
    fireEvent.click(prevButton);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should call onPageChange with next page when Next is clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />);

    const nextButton = screen.getByText('Next →');
    fireEvent.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('should not call onPageChange when disabled Previous is clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />);

    const prevButton = screen.getByText('← Previous');
    fireEvent.click(prevButton);

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('should not call onPageChange when disabled Next is clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={3} onPageChange={onPageChange} />);

    const nextButton = screen.getByText('Next →');
    fireEvent.click(nextButton);

    expect(onPageChange).not.toHaveBeenCalled();
  });
});
