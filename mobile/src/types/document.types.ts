/**
 * Document related TypeScript types
 */

import { DocumentType } from '../constants/document-types';

export interface Document {
  id: number;
  user_id: number;
  type: DocumentType;
  number: string;
  expiry_date: string; // ISO format (YYYY-MM-DD)
  issue_date?: string; // ISO format (YYYY-MM-DD)
  issuing_authority?: string;
  notes?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  status: 'Expired' | 'Expiring Soon' | 'Safe';
  remaining_days: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentRequest {
  type: DocumentType;
  number: string;
  expiryDate: string;
  issueDate?: string;
  issuingAuthority?: string;
  notes?: string;
}

export interface UpdateDocumentRequest {
  type: DocumentType;
  number: string;
  expiryDate: string;
  issueDate?: string;
  issuingAuthority?: string;
  notes?: string;
}

export interface DocumentsResponse {
  success: boolean;
  data: {
    items: Document[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface DocumentResponse {
  success: boolean;
  message?: string;
  data: Document;
}

export interface DocumentFileResponse {
  success: boolean;
  data: {
    url: string;
    expiresAt: string;
  };
}
