import { useState, useEffect } from 'react'
import { fetchDynamicQuery } from '@repo/ui/hooks/api/dynamic-graphql'

// Transformed data type for component display
interface LeaveType {
  id: string
  label: string
  category: string
  leaveCode: string
  leaveTitle: string
  leaveCategory: string
  leaveCodeWithTitle: string
}

export const useLeaveCodesGraphQL = () => {
  const [leaveCodes, setLeaveCodes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallbackData, setUsingFallbackData] = useState(false)

  // Fetch leave codes using GraphQL
  const fetchLeaveCodes = async () => {
    try {
      setLoading(true)
      setError(null)
      setUsingFallbackData(false)

      const leavePolicyFields = {
        fields: [
          'leaveCode',
          'leaveTitle', 
          'leaveCategory'
        ]
      }

      const result = await fetchDynamicQuery(
        leavePolicyFields,
        'leave_policy',
        'FetchAllLeavePolicy',
        'fetchAllLeavePolicy',
        {
          collection: 'leave_policy',
          tenantCode: 'Midhani'
        }
      )

      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch leave codes')
      }

      // Transform the data to match our interface
      const transformedData: LeaveType[] = result.data
        .filter((item: any) => 
          item.leavePolicy.leaveCategory === "Time Away" || 
          item.leavePolicy.leaveCategory === "Leave of Absence"
        )
        .map((item: any) => ({
          id: item.leavePolicy.leaveCode,
          label: `${item.leavePolicy.leaveCode}-${item.leavePolicy.leaveTitle}`,
          category: item.leavePolicy.leaveCategory,
          leaveCode: item.leavePolicy.leaveCode,
          leaveTitle: item.leavePolicy.leaveTitle,
          leaveCategory: item.leavePolicy.leaveCategory,
          leaveCodeWithTitle: `${item.leavePolicy.leaveCode}-${item.leavePolicy.leaveTitle}`
        }))

      setLeaveCodes(transformedData)
      console.log('Transformed leave codes:', transformedData)
    } catch (err) {
      console.error('Error fetching leave codes:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leave codes'
      setError(errorMessage)
      setUsingFallbackData(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveCodes()
  }, [])

  return {
    leaveCodes,
    loading,
    error,
    usingFallbackData,
    refetch: fetchLeaveCodes
  }
} 