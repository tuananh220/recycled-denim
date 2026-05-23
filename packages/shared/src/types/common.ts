export type Role = 'CUSTOMER' | 'ADMIN' | 'STAFF' | 'DESIGNER' | 'WAREHOUSE';

export interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
