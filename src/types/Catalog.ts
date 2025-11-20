/**
 * Catalog API data models
 * Per Technical Specification Section 4.1
 */

export interface CatalogItem {
  itemId: string;
  name: string;
  sku: string;
  unitPrice: number;
  imageUrl: string;
  status: string; // e.g. "active"
}

export interface PagedResult<T> {
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  items: T[];
}
