/**
 * Customer data models
 * Per Technical Specification Section 4.2
 */

export interface Customer {
  customerResourceId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdDate: string;
  lastModifiedDate: string;
}

export interface CustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string; // ISO 8601 date (YYYY-MM-DD)
}
