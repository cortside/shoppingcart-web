/**
 * Catalog page
 * Browse catalog with pagination, search, and sorting
 * Per FR-001 through FR-004
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listItems } from '../../api/catalogApi';
import type { CatalogItem, PagedResult } from '../../types/Catalog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ItemCard from './components/ItemCard';
import ItemGrid from './components/ItemGrid';
import SearchBar from './components/SearchBar';
import SortDropdown from './components/SortDropdown';
import Pagination from './components/Pagination';

const DEFAULT_PAGE_SIZE = 12;

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PagedResult<CatalogItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get query params from URL
  const pageNumber = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'name';

  // Fetch catalog items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await listItems({
          pageNumber,
          pageSize: DEFAULT_PAGE_SIZE,
          search: search || undefined,
          sort: sort || undefined,
        });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load catalog items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [pageNumber, search, sort]);

  // Update URL query params
  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 when search or sort changes
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (value: string) => {
    updateSearchParam('search', value);
  };

  const handleSortChange = (value: string) => {
    updateSearchParam('sort', value);
  };

  const handlePageChange = (page: number) => {
    updateSearchParam('page', String(page));
  };

  const handleRetry = () => {
    globalThis.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Product Catalog</h1>

      {/* Search and Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>
        <div className="md:w-64">
          <SortDropdown value={sort} onChange={handleSortChange} />
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Error State */}
      {error && <ErrorMessage message={error} onRetry={handleRetry} />}

      {/* Items Grid */}
      {!loading && !error && data && (
        <>
          {data.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No items found. Try adjusting your search.</p>
            </div>
          ) : (
            <>
              <ItemGrid>
                {data.items.map((item) => (
                  <ItemCard key={item.itemId} item={item} />
                ))}
              </ItemGrid>

              {/* Pagination */}
              <Pagination
                currentPage={pageNumber}
                totalItems={data.totalItems}
                pageSize={DEFAULT_PAGE_SIZE}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

