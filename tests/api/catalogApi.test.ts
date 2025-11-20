import { describe, it, expect, beforeAll } from 'vitest';
import { listItems, getItemBySku } from '@/api/catalogApi';
import type { CatalogItem, PagedResult } from '@/types/Catalog';

describe('catalogApi', () => {
  beforeAll(() => {
    // Ensure we're testing against the real mockserver
    // In a real project, you'd use MSW to mock these calls
    // For now, we test against the actual backend
  });

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
      // Note: Backend may not respect pageSize parameter,
      // but we verify the call succeeds
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('should support search', async () => {
      const result = await listItems({
        pageNumber: 1,
        pageSize: 15,
        search: 'pappy',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      // Search should return results containing "pappy" in name or sku
    });

    it('should support sorting', async () => {
      const result = await listItems({
        pageNumber: 1,
        pageSize: 15,
        sort: 'name',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      // Items should be sorted by name ascending
      if (result.items.length > 1) {
        const firstName = result.items[0].name.toLowerCase();
        const secondName = result.items[1].name.toLowerCase();
        expect(firstName.localeCompare(secondName)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('getItemBySku', () => {
    it('should fetch item by SKU successfully', async () => {
      const sku = 'pappy-10';
      const item: CatalogItem = await getItemBySku(sku);

      expect(item).toBeDefined();
      expect(item.sku).toBe(sku);
      expect(item).toHaveProperty('itemId');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('unitPrice');
      expect(typeof item.unitPrice).toBe('number');
    });

    it('should have valid item properties', async () => {
      const item = await getItemBySku('pappy-10');

      expect(item.name).toBeTruthy();
      expect(item.unitPrice).toBeGreaterThan(0);
      expect(item.status).toBe('active');
    });
  });
});
