/**
 * Error data models
 * Per Technical Specification Section 8.3
 */

export interface ErrorModel {
  type?: string | null;
  property?: string | null;
  message?: string | null;
  exception?: unknown;
}

export interface ErrorsModel {
  errors?: ErrorModel[] | null;
}
