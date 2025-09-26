// Organization service for server communication
export interface ServerUpdatePayload {
  tenant: string
  action: string
  id: string | null
  collectionName: string
  event: string
  data: any
}

export interface ServerResponse {
  _id: string
  message?: string
  success?: boolean
}

export class OrganizationService {
  private static baseUrl = "http://192.168.88.100:8000/api/command/attendance/organization"

  private static getAuthToken(): string {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) {
      throw new Error('Authentication token not found')
    }
    return token
  }

  static async updateOrganizationData(organizationData: any): Promise<ServerResponse> {
    try {
      const token = this.getAuthToken()

      const payload: ServerUpdatePayload = {
        tenant: "Midhani",
        action: "insert",
        id: null,
        collectionName: "reports",
        event: "reportGeneration",
        data: organizationData
      }

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const responseData: ServerResponse = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update organization data on server')
      }

      // Only proceed if we have a valid _id in the response
      if (!responseData._id) {
        throw new Error('No report ID received from server')
      }

      return responseData
    } catch (error) {
      console.error('Error updating organization data:', error)
      throw error
    }
  }

  static async addLocation(locationData: any, organizationData: any): Promise<ServerResponse> {
    try {
      // First update the local organization data with new location
      const updatedOrganizationData = {
        ...organizationData,
        location: [...(organizationData.location || []), locationData]
      }

      // Then send to server
      return await this.updateOrganizationData(updatedOrganizationData)
    } catch (error) {
      console.error('Error adding location:', error)
      throw error
    }
  }

  static async updateLocation(locationId: string, locationData: any, organizationData: any): Promise<ServerResponse> {
    try {
      // Update the specific location in the organization data
      const updatedOrganizationData = {
        ...organizationData,
        location: organizationData.location?.map((loc: any) => 
          loc.id === locationId || loc._id === locationId ? { ...loc, ...locationData } : loc
        ) || []
      }

      // Then send to server
      return await this.updateOrganizationData(updatedOrganizationData)
    } catch (error) {
      console.error('Error updating location:', error)
      throw error
    }
  }

  static async deleteLocation(locationId: string, organizationData: any): Promise<ServerResponse> {
    try {
      // Remove the specific location from the organization data
      const updatedOrganizationData = {
        ...organizationData,
        location: organizationData.location?.filter((loc: any) => 
          loc.id !== locationId && loc._id !== locationId
        ) || []
      }

      // Then send to server
      return await this.updateOrganizationData(updatedOrganizationData)
    } catch (error) {
      console.error('Error deleting location:', error)
      throw error
    }
  }
}

export default OrganizationService 