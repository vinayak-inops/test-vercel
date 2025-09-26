import { useState, useEffect } from 'react'
import { getSession } from 'next-auth/react'

// API Response Types
interface LeaveCodeData {
  leaveCode: string
  leaveTitle: string
  leaveCategory: string
  active: boolean
}

interface ApiResponse {
  leaveCodes: LeaveCodeData[]
}

// Transformed data type for component display
interface TransformedLeaveCodeData {
  leaveCode: string;
  leaveTitle: string;
  leaveCategory: string;
  leaveCodeWithTitle: string; // Combined format like "CL-Casual Leave"
}

export const useLeaveCodes = (token: string) => {
  const [leaveCodes, setLeaveCodes] = useState<TransformedLeaveCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallbackData, setUsingFallbackData] = useState(false)

  // Transform API data to component format
  const transformApiData = (apiData: ApiResponse): TransformedLeaveCodeData[] => {
    return apiData.leaveCodes.map((leaveCode) => ({
      leaveCode: leaveCode.leaveCode,
      leaveTitle: leaveCode.leaveTitle,
      leaveCategory: leaveCode.leaveCategory,
      leaveCodeWithTitle: `${leaveCode.leaveCode}-${leaveCode.leaveTitle}`,
    }))
  }

  // Fetch leave codes using GraphQL
  const fetchLeaveCodes = async () => {
    // Check if token is available
    if (!token) {
      console.log('No token available, skipping API call');
      setLoading(false);
      setError('Authentication token not available');
      return;
    }

    try {
      setLoading(true)
      setError(null)
      setUsingFallbackData(false)

      // Define the GraphQL query for leave policies
      const query = `
       query FetchAllLeavePolicy {
    fetchAllLeavePolicy(collection: "leave_policy") {
        leavePolicy {
            leaveCode
            leaveTitle
            leaveCategory
        }
    }
}
      `

     const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
      //  const response = await fetch('http://192.168.1.11:8000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        mode: "cors",
        credentials: "include",
        body: JSON.stringify({ query })
      })
      console.log("body",response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const rawData = await response.json()
      console.log('Raw Leave Codes GraphQL Response:', rawData)

      // Extract leave codes from GraphQL response
      if (rawData?.data?.fetchAllLeavePolicy) {
        const leaveCodesData = rawData.data.fetchAllLeavePolicy
          .filter((item: any) => item.leavePolicy.leaveCategory === "Time Away" || item.leavePolicy.leaveCategory === "Leave of Absence")
          .map((item: any) => ({
            leaveCode: item.leavePolicy.leaveCode,
            leaveTitle: item.leavePolicy.leaveTitle,
            leaveCategory: item.leavePolicy.leaveCategory,
            active: true // Default to true since it's not in the query
          }));

        console.log('Leave Codes Data:', leaveCodesData)

        // Transform the leave codes into the expected format
        const apiData: ApiResponse = {
          leaveCodes: leaveCodesData
        }

        const transformedData = transformApiData(apiData)
        setLeaveCodes(transformedData)
        console.log("transformedData",transformedData);
      } else {
        throw new Error('No leave policies data found in response')
      }
    } catch (err) {
      console.error('Error fetching leave codes:', err)
      
      // Set a more user-friendly error message
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leave codes'
      setError(errorMessage)
      
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch if we have a token
    if (token) {
      fetchLeaveCodes()
    } else {
      setLoading(false)
      setError('No authentication token available')
    }
  }, [token]) // Add token as dependency

  return {
    leaveCodes,
    loading,
    error,
    usingFallbackData,
    refetch: fetchLeaveCodes
  }
} 