import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';

// Define the session type
interface CustomSession {
  accessToken?: string;
  expires_at?: number;
  [key: string]: any;
}

/**
 * Custom hook to get the authentication token
 * @returns Object containing the token, loading state, and error state
 */
export const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        const session = await getSession() as CustomSession;
        
        if (!session?.accessToken) {
          throw new Error('No access token available');
        }

        // Check if token is expired
        if (session.expires_at && session.expires_at * 1000 < Date.now()) {
          throw new Error('Token has expired');
        }

        setToken(session.accessToken);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get authentication token'));
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  return { token, loading, error };
}; 