/**
 * Catalog API client
 * Per Technical Specification Section 5.1
 */

import type { CatalogItem, PagedResult } from '../types/Catalog';
import { get } from '../utils/httpClient';
import { getConfig } from '../utils/config';

/**
 * Parameters for listing catalog items
 */
export interface ListItemsParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
}

/**
 * Get catalog API base URL from configuration
 */
function getCatalogApiUrl(): string {
  const config = getConfig();
  return config.catalogApi.url;
}

/**
 * List catalog items with pagination, search, and sorting
 * GET /items
 */
export async function listItems(params: ListItemsParams = {}): Promise<PagedResult<CatalogItem>> {
  const baseUrl = getCatalogApiUrl();
  const url = `${baseUrl}/api/v1/items`;

  return get<PagedResult<CatalogItem>>(url, {
    params: {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      search: params.search,
      sort: params.sort,
    },
  });
}

/**
 * Get a single catalog item by SKU
 * GET /items/{sku}
 */
export async function getItemBySku(sku: string): Promise<CatalogItem> {
  const baseUrl = getCatalogApiUrl();
  const url = `${baseUrl}/api/v1/items/${encodeURIComponent(sku)}`;

  return get<CatalogItem>(url);
}
