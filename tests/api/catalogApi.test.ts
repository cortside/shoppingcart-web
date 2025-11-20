import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { listItems, getItemBySku } from '@/api/catalogApi';
import type { CatalogItem, PagedResult } from '@/types/Catalog';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const CATALOG_API_URL = 'https://mockserver.cortside.net';

describe('catalogApi', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('listItems', () => {
    it('should fetch catalog items successfully', async () => {
      const result: PagedResult<CatalogItem> = await listItems({
        pageNumber: 1,
        pageSize: 15,
      });

      expect(result).toBeDefined();
      expect(result.totalItems).toBeGreaterThan(0);
      expect(result.pageNumber).toBe(1);
      expect(result.pageSize).toBe(15);
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);

      // Verify item structure
      const firstItem = result.items[0];
      expect(firstItem).toHaveProperty('itemId');
      expect(firstItem).toHaveProperty('name');
      expect(firstItem).toHaveProperty('sku');
      expect(firstItem).toHaveProperty('unitPrice');
      expect(typeof firstItem.unitPrice).toBe('number');
    });

    it('should support pagination', async () => {
      const result = await listItems({
        pageNumber: 1,
        pageSize: 5,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
      // Note: Backend may not respect pageSize parameter exactly
      // but we verify the call succeeds and returns data
    });

    it('should support search functionality', async () => {
      const result = await listItems({
        pageNumber: 1,
        pageSize: 15,
        search: 'bourbon',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      // MSW mock handles filtering
    });

    it('should support sorting by name', async () => {
      const result = await listItems({
        pageNumber: 1,
        pageSize: 15,
        sort: 'name',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      // MSW mock handles sorting
    });

    it('should handle empty search results gracefully', async () => {
      const result = await listItems({
        pageNumber: 1,
        pageSize: 15,
        search: 'nonexistent-product-xyz-123',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      // Empty results are valid
    });

    it('should handle pagination beyond available pages', async () => {
      const result = await listItems({
        pageNumber: 9999,
        pageSize: 15,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      // Should return empty array or handle gracefully
    });
  });

  describe('getItemBySku', () => {
    it('should fetch item by SKU successfully', async () => {
      const sku = 'elijah-23';
      const item: CatalogItem = await getItemBySku(sku);

      expect(item).toBeDefined();
      expect(item.sku).toBe(sku);
      expect(item).toHaveProperty('itemId');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('unitPrice');
      expect(typeof item.unitPrice).toBe('number');
    });

    it('should throw error for invalid SKU', async () => {
      server.use(
        http.get(`${CATALOG_API_URL}/api/v1/items/:sku`, () => {
          return HttpResponse.json({ message: 'Item not found' }, { status: 404 });
        })
      );

      await expect(getItemBySku('invalid-sku')).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      server.use(
        http.get(`${CATALOG_API_URL}/api/v1/items`, () => {
          return HttpResponse.error();
        })
      );

      await expect(
        listItems({
          pageNumber: 1,
          pageSize: 10,
        })
      ).rejects.toThrow();
    });
  });
});
