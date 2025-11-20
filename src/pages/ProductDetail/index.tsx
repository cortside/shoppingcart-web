/**
 * Product Detail page
 * Display product details and add to cart functionality
 * Per FR-005, FR-006
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getItemBySku } from '../../api/catalogApi';
import { useCart } from '../../contexts/CartContext';
import type { CatalogItem } from '../../types/Catalog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import QuantitySelector from './components/QuantitySelector';

export default function ProductDetailPage() {
  const { sku } = useParams<{ sku: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [item, setItem] = useState<CatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      if (!sku) {
        setError('Product SKU is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getItemBySku(sku);
        setItem(result);
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('404')) {
            setError('Product not found');
          } else if (err.message.includes('network') || err.message.includes('fetch')) {
            setError('Network error. Please check your connection and try again.');
          } else {
            setError(err.message);
          }
        } else {
          setError('An unexpected error occurred while loading product details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [sku]);

  const handleAddToCart = useCallback(() => {
    if (item) {
      setAddingToCart(true);
      try {
        addItem(item, quantity);
        setShowToast(true);
        setQuantity(1); // Reset quantity after adding
      } finally {
        setAddingToCart(false);
      }
    }
  }, [item, quantity, addItem]);

  const handleRetry = useCallback(() => {
    globalThis.location.reload();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} onRetry={handleRetry} />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/catalog')}>
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="Product not found" />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/catalog')}>
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/catalog" className="text-blue-600 hover:text-blue-700 hover:underline">
          Catalog
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">{item.name}</span>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden bg-gray-100 rounded-lg">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{item.name}</h1>
          <p className="text-lg text-gray-500 mb-6">SKU: {item.sku}</p>
          <p className="text-3xl font-bold text-blue-600 mb-8">${item.unitPrice.toFixed(2)}</p>

          {/* Quantity and Add to Cart */}
          <div className="space-y-6">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <QuantitySelector value={quantity} onChange={setQuantity} />
            </div>

            <div className="flex gap-4">
              <Button onClick={handleAddToCart} loading={addingToCart} className="flex-1">
                Add to Cart
              </Button>
            </div>
          </div>

          {/* Product Status */}
          {item.status === 'active' && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-semibold">In Stock</span> - Ready to ship
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={`${item.name} added to cart!`}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

