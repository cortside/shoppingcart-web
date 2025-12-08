import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ItemCard from '@/pages/Catalog/components/ItemCard';
import type { CatalogItem } from '@/types/Catalog';

const mockItem: CatalogItem = {
  itemId: '1',
  name: 'Test Product',
  sku: 'TEST-001',
  unitPrice: 99.99,
  imageUrl: 'https://example.com/image.jpg',
  status: 'active',
};

describe('ItemCard', () => {
  it('should render item details', () => {
    render(
      <BrowserRouter>
        <ItemCard item={mockItem} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('SKU: TEST-001')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('should render item image with correct src and alt', () => {
    render(
      <BrowserRouter>
        <ItemCard item={mockItem} />
      </BrowserRouter>
    );

    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should link to product detail page', () => {
    render(
      <BrowserRouter>
        <ItemCard item={mockItem} />
      </BrowserRouter>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/TEST-001');
  });

  it('should format price with two decimal places', () => {
    const item = { ...mockItem, unitPrice: 100 };
    render(
      <BrowserRouter>
        <ItemCard item={item} />
      </BrowserRouter>
    );

    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('should lazy load images', () => {
    render(
      <BrowserRouter>
        <ItemCard item={mockItem} />
      </BrowserRouter>
    );

    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('loading', 'lazy');
  });
});
