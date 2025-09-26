import { gql, useQuery } from '@apollo/client';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getSession } from 'next-auth/react';

// Get API URL from environment variables with fallbacks
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL;
};

const API_BASE_URL = getApiBaseUrl();
const GRAPHQL_URL = `${API_BASE_URL}/graphql`;

interface CustomSession {
  accessToken?: string;
  [key: string]: any;
}

// Create the http link
const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
  credentials: 'include',
});


// Create the auth link
const authLink = setContext(async (_, { headers }) => {
  // Get the session
  const session = await getSession() as CustomSession;
  const token = session?.accessToken;
  
console.log("token", token);

  // Return the headers to the context
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  };
});

// Create a singleton Apollo Client
let apolloClient: ApolloClient<any> | null = null;

const createApolloClient = () => {
  if (apolloClient) return apolloClient;

  apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  });

  return apolloClient;
};

// Initialize the client
const client = createApolloClient();

interface DynamicQuerySelection {
  fields: string[];
}

interface DynamicQueryVariables {
  collection: string;
  id?: string; // Add explicit type for id
  [key: string]: any; // Allow additional variables
}

interface DynamicQueryResult {
  [key: string]: any[]; // This will match any operation name
}

// Helper function to build the query
const buildDynamicQuery = (
  selection: DynamicQuerySelection,
  operationName: string,
  operationType: string,
  additionalVariables?: Record<string, any>
) => {
  // Build variable definitions - start with collection
  const variableDefinitions = ['$collection: String!'];
  
  // Build operation arguments - start with collection
  const operationArgs = ['collection: $collection'];
  
  if (additionalVariables) {
    Object.keys(additionalVariables).forEach(key => {
      // Skip collection as it's already handled
      if (key === 'collection') return;
      
      // Special handling for 'id' parameter to use ID! type
      if (key === 'id') {
        variableDefinitions.push(`$${key}: ID!`);
      } else {
        // Use String! for non-nullable strings based on the error message
        variableDefinitions.push(`$${key}: String!`);
      }
      operationArgs.push(`${key}: $${key}`);
    });
  }

  return gql`
    query ${operationName}(${variableDefinitions.join(', ')}) {
      ${operationType}(${operationArgs.join(', ')}) {
        ${selection.fields.join('\n        ')}
      }
    }
  `;
};

interface UseDynamicQueryResult {
  data: any[]; // TODO: Replace with proper type based on your schema
  loading: boolean;
  error: Error | undefined;
}

/**
 * A dynamic GraphQL query hook that can be used to fetch data from any collection
 * @param selection - The fields to select from the query
 * @param collection - The collection name to query
 * @param operationName - The name of the GraphQL operation
 * @param operationType - The type of operation (e.g., fetchAllWorkflows, fetchAllFileDetails)
 * @param additionalVariables - Additional variables to include in the query
 * @returns The query result with data, loading state, and any errors
 */
export const useDynamicQuery = (
  selection: DynamicQuerySelection,
  collection: string,
  operationName: string,
  operationType: string,
  additionalVariables?: Record<string, any>
): UseDynamicQueryResult => {
  const query = buildDynamicQuery(selection, operationName, operationType, additionalVariables);
  
  // Filter out collection from additionalVariables to avoid duplication
  const filteredAdditionalVariables = additionalVariables 
    ? Object.fromEntries(
        Object.entries(additionalVariables).filter(([key]) => key !== 'collection')
      )
    : {};
    
  const variables: DynamicQueryVariables = { 
    collection,
    ...filteredAdditionalVariables
  };

  const { data, loading, error } = useQuery<DynamicQueryResult, DynamicQueryVariables>(query, {
    client, // Use the singleton client instance
    variables,
    onCompleted: (data) => {
      console.log('GraphQL Response:', {
        operationType,
        data: data?.[operationType],
      });
    },
    onError: (error) => {
      console.error('GraphQL Error Details:', {
        message: error.message,
        operationType,
        variables,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError
      });
    }
  });

  // Add validation for nested data
  const validateNestedData = (data: any) => {
    if (!data) return null;
    
    // Check if the data is an array and has items
    if (Array.isArray(data)) {
      return data.length > 0 ? data : null;
    }
    
    // Check if the data is an object and has nested arrays
    if (typeof data === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          result[key] = value.length > 0 ? value : null;
        } else if (typeof value === 'object' && value !== null) {
          result[key] = validateNestedData(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    }
    
    return data;
  };

  const processedData = data?.[operationType] ? validateNestedData(data[operationType]) : null;
  
  // Debug log for processed data
  if (processedData) {
    console.log('Processed Data:', {
      operationType,
      hasData: !!processedData,
      dataKeys: Object.keys(processedData),
      nestedArrays: Object.entries(processedData)
        .filter(([_, value]) => Array.isArray(value))
        .map(([key, value]) => ({
          key,
          length: (value as any[]).length,
          isEmpty: (value as any[]).length === 0
        }))
    });
  }
  
  return {
    data: processedData || [],
    loading,
    error,
  };
};

// Update the standalone fetch function to use the singleton client
export async function fetchDynamicQuery(
  selection: DynamicQuerySelection,
  collection: string,
  operationName: string,
  operationType: string,
  additionalVariables?: Record<string, any>
) {
  const query = buildDynamicQuery(selection, operationName, operationType, additionalVariables);
  
  // Filter out collection from additionalVariables to avoid duplication
  const filteredAdditionalVariables = additionalVariables 
    ? Object.fromEntries(
        Object.entries(additionalVariables).filter(([key]) => key !== 'collection')
      )
    : {};
    
  const variables: DynamicQueryVariables = {
    collection,
    ...filteredAdditionalVariables
  };

  try {
    const { data } = await client.query({
      query,
      variables,
    });

    // Use the same validateNestedData logic
    const validateNestedData = (data: any) => {
      if (!data) return null;
      if (Array.isArray(data)) {
        return data.length > 0 ? data : null;
      }
      if (typeof data === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value)) {
            result[key] = value.length > 0 ? value : null;
          } else if (typeof value === 'object' && value !== null) {
            result[key] = validateNestedData(value);
          } else {
            result[key] = value;
          }
        }
        return result;
      }
      return data;
    };
    const processedData = data?.[operationType] ? validateNestedData(data[operationType]) : null;
    return {
      data: processedData || [],
      loading: false,
      error: undefined,
    };
  } catch (error: any) {
    console.error('GraphQL Query Error:', {
      message: error.message,
      operationType,
      variables,
      graphQLErrors: error.graphQLErrors,
      networkError: error.networkError
    });

    return {
      data: [],
      loading: false,
      error,
    };
  }
} 