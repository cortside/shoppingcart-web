import type { CatalogItem, PagedResult } from '@/types/Catalog';

/**
 * Mock catalog data for testing
 */
export const mockCatalogItems: CatalogItem[] = [
  {
    itemId: '1',
    name: "Blantons Single Barrel",
    sku: 'blantons',
    unitPrice: 59.99,
    imageUrl: 'https://example.com/blantons.jpg',
    status: 'active',
  },
  {
    itemId: '2',
    name: 'Buffalo Trace',
    sku: 'buffalo-trace',
    unitPrice: 29.99,
    imageUrl: 'https://example.com/buffalo.jpg',
    status: 'active',
  },
  {
    itemId: '3',
    name: "Eagle Rare 10 Year",
    sku: 'eagle-rare-10',
    unitPrice: 39.99,
    imageUrl: 'https://example.com/eagle.jpg',
    status: 'active',
  },
  {
    itemId: '4',
    name: 'Pappy Van Winkle 10 Year',
    sku: 'pappy-10',
    unitPrice: 999.99,
    imageUrl: 'https://example.com/pappy10.jpg',
    status: 'active',
  },
  {
    itemId: '5',
    name: 'Pappy Van Winkle 15 Year',
    sku: 'pappy-15',
    unitPrice: 1499.99,
    imageUrl: 'https://example.com/pappy15.jpg',
    status: 'active',
  },
  {
    itemId: '6',
    name: 'Weller 12 Year',
    sku: 'weller-12',
    unitPrice: 49.99,
    imageUrl: 'https://example.com/weller.jpg',
    status: 'active',
  },
];

/**
 * Create a paged result from mock data
 */
export function createPagedResult<T>(
  items: T[],
  pageNumber: number,
  pageSize: number
): PagedResult<T> {
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedItems = items.slice(startIndex, endIndex);

  return {
    totalItems: items.length,
    pageNumber,
    pageSize,
    items: pagedItems,
  };
}

/**
 * Filter items by search term
 */
export function filterBySearch(items: CatalogItem[], search: string): CatalogItem[] {
  const term = search.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(term) || item.sku.toLowerCase().includes(term)
  );
}

/**
 * Sort items by field
 */
export function sortItems(items: CatalogItem[], sort: string): CatalogItem[] {
  const sorted = [...items];
  if (sort === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'price') {
    sorted.sort((a, b) => a.unitPrice - b.unitPrice);
  }
  return sorted;
}
