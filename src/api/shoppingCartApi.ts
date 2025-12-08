/**
 * ShoppingCart API client
 * Per Technical Specification Section 5.2
 */

import type { Customer, CustomerInput } from '../types/Customer';
import type { Order, Address } from '../types/Orders';
import type { PagedResult } from '../types/Catalog';
import { get, post, put } from '../utils/httpClient';
import { getConfig } from '../utils/config';

/**
 * Get ShoppingCart API base URL from configuration
 */
function getShoppingCartApiUrl(): string {
  const config = getConfig();
  return config.shoppingCartApi.url;
}

// ============================================================================
// Customer Endpoints
// ============================================================================

/**
 * Create a new customer
 * POST /v1/customers
 */
export async function createCustomer(customer: CustomerInput): Promise<Customer> {
  const baseUrl = getShoppingCartApiUrl();
  const url = `${baseUrl}/api/v1/customers`;

  return post<CustomerInput, Customer>(url, customer, { requiresAuth: true });
}

/**
 * Get customer by ID
 * GET /v1/customers/{id}
 */
export async function getCustomer(id: string): Promise<Customer> {
  const baseUrl = getShoppingCartApiUrl();
  const url = `${baseUrl}/api/v1/customers/${encodeURIComponent(id)}`;

  return get<Customer>(url, { requiresAuth: true });
}

/**
 * Update customer
 * PUT /v1/customers/{id}
 */
export async function updateCustomer(id: string, customer: CustomerInput): Promise<Customer> {
  const baseUrl = getShoppingCartApiUrl();
  const url = `${baseUrl}/api/v1/customers/${encodeURIComponent(id)}`;

  return put<CustomerInput, Customer>(url, customer, { requiresAuth: true });
}

// ============================================================================
// Order Endpoints
// ============================================================================

/**
 * Payload for creating order with new customer
 */
export interface CreateOrderForNewCustomerPayload {
  customer: CustomerInput;
  address: Address;
  items: { sku: string; quantity: number }[];
}

/**
 * Payload for creating order with existing customer
 */
export interface CreateOrderForExistingCustomerPayload {
  address: Address;
  items: { sku: string; quantity: number }[];
}

/**
 * Create order for a new customer
 * POST /v1/orders
 */
export async function createOrderForNewCustomer(
  payload: CreateOrderForNewCustomerPayload
): Promise<Order> {
  const baseUrl = getShoppingCartApiUrl();
  const url = `${baseUrl}/api/v1/orders`;

  return post<CreateOrderForNewCustomerPayload, Order>(url, payload, { requiresAuth: true });
}

/**
 * Create order for an existing customer
 * POST /v1/customers/{resourceId}/orders
 */
export async function createOrderForExistingCustomer(
  customerResourceId: string,
  payload: CreateOrderForExistingCustomerPayload
): Promise<Order> {
  const baseUrl = getShoppingCartApiUrl();
  const url = `${baseUrl}/api/v1/customers/${encodeURIComponent(customerResourceId)}/orders`;

  return post<CreateOrderForExistingCustomerPayload, Order>(url, payload, { requiresAuth: true });
}

/**
 * Parameters for listing orders
 */
export interface ListOrdersParams {
  CustomerResourceId: string;
  PageNumber?: number;
  PageSize?: number;
  Sort?: string;
}

/**
 * List orders for a customer
 * GET /v1/orders
 */
export async function listOrders(params: ListOrdersParams): Promise<PagedResult<Order>> {
  const baseUrl = getShoppingCartApiUrl();
  const url = `${baseUrl}/api/v1/orders`;

  return get<PagedResult<Order>>(url, {
    params: {
      CustomerResourceId: params.CustomerResourceId,
      PageNumber: params.PageNumber,
      PageSize: params.PageSize,
      Sort: params.Sort,
    },
    requiresAuth: true,
  });
}

/**
 * Get order detail by ID
 * GET /v1/orders/{id}
 */
export async function getOrder(id: string): Promise<Order> {
  const baseUrl = getShoppingCartApiUrl();
  const url = `${baseUrl}/api/v1/orders/${encodeURIComponent(id)}`;

  return get<Order>(url, { requiresAuth: true });
}
