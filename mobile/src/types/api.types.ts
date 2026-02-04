/**
 * API response related TypeScript types
 */

export interface ApiError {
  status: number;
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: {
    field: string;
    message: string;
  }[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface FilterParams {
  status?: 'Expired' | 'Expiring Soon' | 'Safe';
  category?: string;
  type?: string;
  search?: string;
}
