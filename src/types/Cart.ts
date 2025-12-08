/**
 * Cart data models (local state)
 * Per Technical Specification Section 4.4
 */

export interface CartItem {
  itemId: string;
  sku: string;
  name: string;
  unitPrice: number;
  imageUrl: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}
