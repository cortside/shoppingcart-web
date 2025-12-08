import { http, HttpResponse } from 'msw';
import {
  mockCatalogItems,
  createPagedResult,
  filterBySearch,
  sortItems,
} from './catalogData';

// catalogApi.ts adds /api/v1 prefix, so handlers must match that full path
const CATALOG_API_URL = 'https://mockserver.cortside.net';

export const handlers = [
  // GET /api/v1/items - List catalog items
  http.get(`${CATALOG_API_URL}/api/v1/items`, ({ request }) => {
    const url = new URL(request.url);
    const pageNumber = Number.parseInt(url.searchParams.get('pageNumber') || '1', 10);
    const pageSize = Number.parseInt(url.searchParams.get('pageSize') || '15', 10);
    const search = url.searchParams.get('search') || '';
    const sort = url.searchParams.get('sort') || '';

    let items = [...mockCatalogItems];

    // Apply search filter
    if (search) {
      items = filterBySearch(items, search);
    }

    // Apply sorting
    if (sort) {
      items = sortItems(items, sort);
    }

    // Apply pagination
    const result = createPagedResult(items, pageNumber, pageSize);

    return HttpResponse.json(result);
  }),

  // GET /api/v1/items/:sku - Get item by SKU
  http.get(`${CATALOG_API_URL}/api/v1/items/:sku`, ({ params }) => {
    const { sku } = params;
    const item = mockCatalogItems.find((i) => i.sku === sku);

    if (!item) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Not Found',
      });
    }

    return HttpResponse.json(item);
  }),
];
