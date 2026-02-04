/**
 * Documents Service
 * API calls for document operations
 */

import apiClient from './api';
import {
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentResponse,
} from '../types/document.types';
import { ApiResponse } from '../types/api.types';

export interface DocumentsListParams {
  status?: 'Expired' | 'Expiring Soon' | 'Safe';
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'expiry_asc' | 'expiry_desc' | 'type_asc' | 'type_desc' | 'created_asc' | 'created_desc';
}

export interface DocumentsListResponse {
  success: boolean;
  data: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get all documents for authenticated user
 */
export const getDocuments = async (
  params?: DocumentsListParams
): Promise<DocumentsListResponse> => {
  const response = await apiClient.get<DocumentsListResponse>('/documents', { params });
  return response.data;
};

/**
 * Get single document by ID
 */
export const getDocument = async (id: number): Promise<Document> => {
  const response = await apiClient.get<DocumentResponse>(`/documents/${id}`);
  return response.data.data;
};

/**
 * Create new document
 */
export const createDocument = async (
  data: CreateDocumentRequest,
  file?: { uri: string; name: string; type: string }
): Promise<Document> => {
  const formData = new FormData();

  // Add document fields - only append if value exists to avoid sending "undefined" strings
  formData.append('type', data.type);
  formData.append('number', data.number);
  formData.append('expiryDate', data.expiryDate);

  // Only append optional fields if they have actual values
  if (data.issueDate !== undefined && data.issueDate !== null && data.issueDate !== '') {
    formData.append('issueDate', data.issueDate);
  }
  if (
    data.issuingAuthority !== undefined &&
    data.issuingAuthority !== null &&
    data.issuingAuthority !== ''
  ) {
    formData.append('issuingAuthority', data.issuingAuthority);
  }
  if (data.notes !== undefined && data.notes !== null && data.notes !== '') {
    formData.append('notes', data.notes);
  }

  // Add file if present
  if (file) {
    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      uri: file.uri,
    });
    // For web platform, we need to handle file differently
    if (typeof file.uri === 'string' && file.uri.startsWith('blob:')) {
      // Web platform - fetch the blob and append it
      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append('file', blob, file.name);
      } catch (error) {
        console.error('Error converting file to blob:', error);
      }
    } else {
      // Native platform - use the file object directly
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    }
  }

  const response = await apiClient.post<DocumentResponse>('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log('Document created:', response.data.data);
  return response.data.data;
};

/**
 * Update document
 */
export const updateDocument = async (
  id: number,
  data: UpdateDocumentRequest,
  file?: { uri: string; name: string; type: string }
): Promise<Document> => {
  const formData = new FormData();

  // Add required document fields
  formData.append('type', data.type);
  formData.append('number', data.number);
  formData.append('expiryDate', data.expiryDate);

  // Optional fields - only send if they have actual values (not undefined, null, or empty string)
  if (data.issueDate !== undefined && data.issueDate !== null && data.issueDate !== '') {
    formData.append('issueDate', data.issueDate);
  }
  if (data.issuingAuthority !== undefined && data.issuingAuthority !== null) {
    formData.append('issuingAuthority', data.issuingAuthority);
  }
  if (data.notes !== undefined && data.notes !== null) {
    formData.append('notes', data.notes);
  }

  // Add file if present
  if (file) {
    console.log('Updating file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      uri: file.uri,
    });
    // For web platform, we need to handle file differently
    if (typeof file.uri === 'string' && file.uri.startsWith('blob:')) {
      // Web platform - fetch the blob and append it
      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append('file', blob, file.name);
      } catch (error) {
        console.error('Error converting file to blob:', error);
      }
    } else {
      // Native platform - use the file object directly
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    }
  }

  const response = await apiClient.put<DocumentResponse>(`/documents/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log('Document updated:', response.data.data);
  return response.data.data;
};

/**
 * Delete document
 */
export const deleteDocument = async (id: number): Promise<void> => {
  await apiClient.delete<ApiResponse>(`/documents/${id}`);
};

/**
 * Get document file download URL
 */
export const getDocumentDownloadUrl = (id: number): string => {
  return `/documents/${id}/download`;
};

/**
 * Download document file
 */
export const downloadDocument = async (id: number): Promise<Blob> => {
  const response = await apiClient.get(`/documents/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Get documents expiring soon (within 30 days)
 */
export const getExpiringSoonDocuments = async (): Promise<Document[]> => {
  const response = await getDocuments({ status: 'Expiring Soon', sort: 'expiry_asc' });
  return response.data;
};
