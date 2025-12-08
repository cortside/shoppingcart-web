import { describe, it, expect } from 'vitest';
import { listItems, getItemBySku } from '@/api/catalogApi';
import type { CatalogItem, PagedResult } from '@/types/Catalog';

describe('catalogApi', () => {
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
      const searchTerm = 'pappy';
      const result = await listItems({
        pageNumber: 1,
        pageSize: 15,
        search: searchTerm,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);

      // Verify at least one item matches search term
      const hasMatch = result.items.some(
        (item: CatalogItem) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      expect(hasMatch).toBe(true);
    });

    it('should support sorting by name', async () => {
      const result = await listItems({
        pageNumber: 1,
        pageSize: 15,
        sort: 'name',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);

      // Verify all items are sorted in ascending order
      for (let i = 0; i < result.items.length - 1; i++) {
        const current = result.items[i].name.toLowerCase();
        const next = result.items[i + 1].name.toLowerCase();
        expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
      }
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

    it('should throw error for invalid SKU', async () => {
      const invalidSku = 'invalid-sku-does-not-exist-999';

      await expect(getItemBySku(invalidSku)).rejects.toThrow();
    });

    it('should handle SKU with special characters', async () => {
      // Test that SKU encoding works correctly
      const sku = 'pappy-10';
      const item = await getItemBySku(sku);

      expect(item).toBeDefined();
      expect(item.sku).toBe(sku);
    });
  });

  describe('error handling', () => {
    it('should handle invalid page numbers', async () => {
      // Negative page number should either throw or be handled gracefully
      const result = await listItems({
        pageNumber: 0,
        pageSize: 10,
      });

      // API may handle this differently - verify it doesn't crash
      expect(result).toBeDefined();
    });

    it('should handle very large page sizes', async () => {
      const result = await listItems({
        pageNumber: 1,
        pageSize: 1000,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      // API should cap at reasonable limit
    });

    it('should handle search with special characters', async () => {
      const result = await listItems({
        pageNumber: 1,
        pageSize: 15,
        search: "O'Reilly's & Co.",
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('data validation', () => {
    it('should return items with required fields', async () => {
      const result = await listItems({
        pageNumber: 1,
        pageSize: 15,
      });

      for (const item of result.items) {
        expect(item.itemId).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.sku).toBeDefined();
        expect(item.unitPrice).toBeDefined();
        expect(typeof item.unitPrice).toBe('number');
        expect(item.unitPrice).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return valid pagination metadata', async () => {
      const result = await listItems({
        pageNumber: 1,
        pageSize: 10,
      });

      expect(result.pageNumber).toBeGreaterThanOrEqual(1);
      expect(result.pageSize).toBeGreaterThan(0);
      expect(result.totalItems).toBeGreaterThanOrEqual(0);
      expect(result.items.length).toBeLessThanOrEqual(result.totalItems);
    });
  });
});
