import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthToken } from "../auth/useAuthToken";
import { EventSourcePolyfill } from 'event-source-polyfill';

// Get API URL from environment variables with fallbacks
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL;
};

const API_BASE_URL = getApiBaseUrl();

interface WorkflowEvent {
  tenant: string;
  action: string;
  collectionName: string;
  id: string;
  data: any;
}

interface WorkflowSSEGrouped {
  [id: string]: any[];
}

type SSEStatus = "idle" | "connecting" | "connected" | "error";

export function useWorkflowSSE() {
  const { token } = useAuthToken();
  const [workflows, setWorkflows] = useState<WorkflowSSEGrouped>({});
  const [status, setStatus] = useState<SSEStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);

  const connect = useCallback(() => {
    if (!token) {
      setStatus("idle");
      return;
    }

    // Ensure any old connection is closed before starting a new one
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus("connecting");
    setError(null);

    const url = `http://192.168.64.61:8000/api/query/attendance/sse`;
    const eventSource = new EventSourcePolyfill(url, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setStatus("connected");
      setError(null);
    };

    eventSource.onmessage = (event: any) => {
      let raw = event.data;
      if (raw.startsWith("data:")) raw = raw.slice(5);
      try {
        if (!raw) return; // Ignore empty messages
        const parsed: WorkflowEvent = JSON.parse(raw);
        setWorkflows(prev => {
          const id = parsed.id;
          const entry = prev[id] ? [...prev[id]] : [];
          // Deduplicate to prevent identical entries
          if (!entry.find(e => JSON.stringify(e) === JSON.stringify(parsed.data))) {
            entry.push(parsed.data);
          }
          return { ...prev, [id]: entry };
        });
      } catch (e) {
        setStatus("error");
        setError("Failed to parse event data.");
        console.error("Failed to parse SSE data", e, raw);
      }
    };

    eventSource.onerror = (err: any) => {
      setStatus("error");
      setError("Connection to server failed.");
      console.error("SSE connection error", err);
      eventSource.close(); // Close the connection on error
    };
  }, [token]);

  useEffect(() => {
    connect();
    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return { workflows, status, error, reconnect: connect };
} 