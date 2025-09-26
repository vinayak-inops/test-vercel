import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Get API URL from environment variables with fallbacks
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL;
};

const API_BASE_URL = getApiBaseUrl();

// Generic response type that can be used for any data type
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Configuration options for the API request
export interface ApiRequestOptions {
  baseURL: string;
  endpoint: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Generic GET request function that can be used for any API endpoint
 * @param options - Configuration for the request including baseURL, endpoint, params, etc.
 * @returns Promise containing the response data or error
 */
export const fetchData = async <T>(options: ApiRequestOptions): Promise<ApiResponse<T>> => {
  const {
    baseURL,
    endpoint,
    params,
    headers = {},
    timeout = 30000
  } = options;

  const config: AxiosRequestConfig = {
    baseURL,
    url: endpoint,
    method: 'GET',
    params,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    timeout
  };

  try {
    const response = await axios.request<T>(config);
    return {
      data: response.data,
      error: null
    };
  } catch (err) {
    const error = err as AxiosError<{ error?: string; message?: string }>;
    return {
      data: null,
      error: error.response?.data?.error || 
             error.response?.data?.message || 
             error.message || 
             'Failed to fetch data'
    };
  }
};

// Define the report type - adjust these fields based on your actual report structure
export interface Report {
  id: string;
  // Add other report fields here
  [key: string]: any;
}

export interface GetReportsResponse extends ApiResponse<Report[]> {}

export const fetchReports = async (options: { 
  endpoint?: string; 
  params?: Record<string, any>;
  token?: string;
  method?: 'GET' | 'POST';
  body?: any;
} = {}): Promise<GetReportsResponse> => {
  try {
    const baseURL = `${API_BASE_URL}/api/query/attendance`;
    const method = options.method || 'GET';
    const config: AxiosRequestConfig = {
      timeout: 10000,
      validateStatus: (status) => status >= 200 && status < 300,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.token && { 'Authorization': `Bearer ${options.token}` })
      },
      withCredentials: true
    };
    let response;
    if (method === 'POST') {
      response = await axios.post(
        `${baseURL}/${options.endpoint || 'tenantReportConfiguration/6827076ad74e6f59df5f216'}`,
        options.body || {},
        config
      );
    } else {
      response = await axios.get(
        `${baseURL}/${options.endpoint || 'tenantReportConfiguration/6827076ad74e6f59df5f216'}`,
        {
          ...config,
          params: options.params
        }
      );
    }
    return {
      data: response.data,
      error: null
    };
  } catch (err) {
    const error = err as AxiosError;
    console.error('Network Error Details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url
    });

    let errorMessage = 'Failed to fetch reports';
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please try again.';
    } else if (!error.response) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.response.status === 401) {
      errorMessage = 'Authentication required. Please login again.';
    } else if (error.response.status === 404) {
      errorMessage = 'Report endpoint not found.';
    } else if (error.response.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    return {
      data: null,
      error: errorMessage
    };
  }
};