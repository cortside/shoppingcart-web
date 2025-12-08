/**
 * ItemCard component
 * Display catalog item with image, name, SKU, and price
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { CatalogItem } from '../../../types/Catalog';

interface ItemCardProps {
  readonly item: CatalogItem;
}

const ItemCard = memo(function ItemCard({ item }: ItemCardProps) {
  return (
    <Link
      to={`/product/${item.sku}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
        <p className="text-sm text-gray-500 mb-2">SKU: {item.sku}</p>
        <p className="text-xl font-bold text-blue-600">${item.unitPrice.toFixed(2)}</p>
      </div>
    </Link>
  );
});

export default ItemCard;
