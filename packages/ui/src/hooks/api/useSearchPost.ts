import { useState } from 'react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthToken } from '../auth/useAuthToken';

// Get API URL from environment variables with fallbacks
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL;
};

const API_BASE_URL = getApiBaseUrl();

interface CustomSession {
  accessToken?: string;
  [key: string]: any;
}

interface UsePostRequestOptions<T> {
  url: string;
  data?: any;
  files?: File | File[]; // Support for single file or multiple files
  headers?: Record<string, string>; // Custom headers
  config?: AxiosRequestConfig;
  requireAuth?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
  onProgress?: (progress: number) => void; // For file upload progress
}

interface UsePostRequestResult<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError | null;
  uploadProgress: number;
  post: (postData?: any) => Promise<void>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Custom hook for making POST requests with support for file uploads
 * @param options - Configuration options for the request
 * @returns Object containing data, loading state, error state, upload progress, and post function
 */
export const usePostSearch = <T>({
  url,
  data: initialData,
  files,
  headers = {},
  config = {},
  requireAuth = true,
  onSuccess,
  onError,
  onProgress
}: UsePostRequestOptions<T>): UsePostRequestResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { token, loading: tokenLoading, error: tokenError } = useAuthToken();

  console.log("🔧 Hook initialized with:", {
    url,
    initialData,
    requireAuth,
    hasToken: !!token,
    tokenLoading,
    tokenError: !!tokenError
  });

  const post = async (postData?: any, retryCount = 0) => {
    console.log("🚀 Hook post function called with:", { postData, retryCount });
    
    try {
      if (requireAuth && tokenLoading) {
        console.log("⏳ Waiting for token to load...");
        return; // Wait for token to be loaded
      }

      if (requireAuth && tokenError) {
        console.log("❌ Token error:", tokenError.message);
        throw new Error(tokenError.message);
      }

      if (requireAuth && !token) {
        console.log("❌ No access token available");
        throw new Error('No access token available');
      }

      console.log("✅ Authentication checks passed, proceeding with request");

      setLoading(true);
      setError(null);
      setUploadProgress(0);

      // Prepare request data
      let requestData: any;
      let requestHeaders: Record<string, string> = {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      };

      console.log("📋 Preparing request data:", {
        initialData,
        postData,
        files: !!files,
        headers: requestHeaders
      });

      // Handle file uploads
      if (files) {
        const formData = new FormData();
        
        // Add files to form data
        if (Array.isArray(files)) {
          files.forEach((file, index) => {
            formData.append(`file${index}`, file);
          });
        } else {
          formData.append('file', files);
        }

        // Add other data to form data
        const dataToSend = postData || initialData;
        if (dataToSend) {
          Object.entries(dataToSend).forEach(([key, value]) => {
            formData.append(key, value as string);
          });
        }

        requestData = formData;
        // Don't set Content-Type for FormData, let the browser set it with boundary
        delete requestHeaders['Content-Type'];
      } else {
        // Regular JSON request
        requestData = postData || initialData;
        requestHeaders['Content-Type'] = 'application/json';
      }

      console.log("📤 Final request data:", requestData);

      console.log("🔍 Hook executing POST request:", {
        url: `${API_BASE_URL}/api/query/${url}`,
        data: requestData,
        headers: requestHeaders
      });

      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/api/query/attendance/${url}`,
        data: requestData,
        headers: requestHeaders,
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
            onProgress?.(progress);
          }
        },
        ...config,
      });

      console.log("✅ Hook received response:", response.data);

      const responseData = response.data;
      setData(responseData);
      onSuccess?.(responseData);

    } catch (err) {
      const error = err as AxiosError;
      console.log("❌ Hook caught error:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setError(error);
      if (onError) {
        onError(error);
      }
    } finally {
      console.log("🏁 Hook request completed, setting loading to false");
      setLoading(false);
    }
  };

  // Convert tokenError to AxiosError if it exists
  const combinedError = error || (tokenError ? new AxiosError(tokenError.message) : null);

  return {
    data,
    loading: loading || tokenLoading,
    error: combinedError,
    uploadProgress,
    post,
  };
};

// Example usage:
/*
// For regular JSON POST
const { post, loading, error, data } = usePostRequest<any>({
  url: 'uploadfile',
  data: {
    name: 'example',
    description: 'test'
  },
  headers: {
    'X-workflow': 'workflow1',
    'X-Tenant': 'BHEL'
  },
  onSuccess: (response) => {
    console.log('Upload successful:', response);
  },
  onError: (error) => {
    console.error('Upload failed:', error);
  }
});

// For file upload
const { post, loading, error, uploadProgress } = usePostRequest<any>({
  url: 'uploadfile',
  files: selectedFile,
  headers: {
    'X-workflow': 'workflow1',
    'X-Tenant': 'BHEL'
  },
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
});

// Call the post function
await post();
*/ 