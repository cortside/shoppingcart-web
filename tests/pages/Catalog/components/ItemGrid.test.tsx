import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ItemGrid from '@/pages/Catalog/components/ItemGrid';

describe('ItemGrid', () => {
  it('should render children', () => {
    render(
      <ItemGrid>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </ItemGrid>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should have grid layout classes', () => {
    const { container } = render(
      <ItemGrid>
        <div>Item</div>
      </ItemGrid>
    );

    const grid = container.firstChild;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('sm:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
    expect(grid).toHaveClass('xl:grid-cols-4');
  });
});
