"use client";

import React, { useCallback, useEffect, useState } from "react"
import LiveDataGraph from "./livedatagraph1";
import PresentAbsent from "../components/presentabsent";
import LiveDataGraphLocationWise from "../components/LiveDataGraphlocationwise";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent } from "@repo/ui/components/ui/card"
import { useAuthToken } from "@repo/ui/hooks/auth/useAuthToken";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import PresentAbsentLocationSelection from "./PresentAbsentlocationselection";
import { RefreshCw } from "lucide-react"; // Import refresh icon


export default function LocationWiseGraph() {
    const [value, setValue] = useState("")
    const [selectedName, setSelectedName] = useState("");
    const [selectedNamediv, setSelectedNamediv] = useState("");
    const [selectedNamedept, setSelectedNamedept] = useState("");
    const [locations, setLocations] = useState<Array<{code: string, name: string}>>([]);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for triggering data refresh
    const [isRefreshing, setIsRefreshing] = useState(false); // Add loading state
    const [uniqueSubsidiaries, setUniqueSubsidiaries] = useState<any[]>([]);
    const [uniqueDivisions, setUniqueDivisions] = useState<any[]>([]); // Add state for unique divisions
    const [uniqueDepartments, setUniqueDepartments] = useState<any[]>([]); // Add state for unique departments
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const namesdiv = ["div1", "div2", "div3", "div4", "div5"];
    const namesdept = ["dept1", "dept2", "dept3", "dept4", "dept5"];

    const [formData, setFormData] = useState({
        category: "",
        name: "",
        email: "",
        location: "",
        message: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Form submitted:", formData)
        // Handle form submission here
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    // Handle location change and trigger refresh
    const handleLocationChange = (locationCode: string) => {
        setIsRefreshing(true); // Show loading state
        setSelectedLocation(locationCode);
        setRefreshKey(prev => prev + 1); // Increment refresh key to trigger data refresh
        // Reset other selections when location changes
        setSelectedName("");
        setSelectedNamediv("");
        setSelectedNamedept("");
        setUniqueDivisions([]); // Reset divisions when location changes
        setUniqueDepartments([]); // Reset departments when location changes
        setError(null); // Clear any previous errors
        
        // Hide loading state after a short delay to allow components to refresh
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    }

    // Manual refresh function
    const handleManualRefresh = () => {
        if (selectedLocation && token) {
            setIsRefreshing(true);
            setError(null);
            setRefreshKey(prev => prev + 1);
            setTimeout(() => {
                setIsRefreshing(false);
            }, 1000);
        }
    }

    // Handle subsidiary selection and fetch divisions
    const handleSubsidiarySelection = (subsidiaryCode: string) => {
        setSelectedName(subsidiaryCode);
        setSelectedNamediv(""); // Reset division selection
        setSelectedNamedept(""); // Reset department selection
        setUniqueDepartments([]); // Reset departments when subsidiary changes
        setError(null); // Clear any previous errors
        // The useRequest hook will automatically refetch when dependencies change
    }

    // Handle division selection and fetch departments
    const handleDivisionSelection = (divisionCode: string) => {
        setSelectedNamediv(divisionCode);
        setSelectedNamedept(""); // Reset department selection
        setError(null); // Clear any previous errors
        // The useRequest hook will automatically refetch when dependencies change
    }

    const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
   
    // Helper function to validate token
    const validateToken = (token: string | null): boolean => {
        if (!token || token.trim() === '') {
            console.warn('Token is null, empty, or whitespace');
            return false;
        }
        return true;
    };

    // Helper function to create headers with token
    const createHeaders = (token: string) => {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.trim()}`,
            'Accept': 'application/json',
        };
    };

    useEffect(() => {
        // Don't make API call if token is loading or not available
        if (tokenLoading || !token) {
            return;
        }

        // Validate token before making API call
        if (!validateToken(token)) {
            setError('Invalid authentication token');
            return;
        }

        setLoadingLocations(true);
        setError(null);

        // Define the GraphQL query
        const query = `
    query GetOrganizationByCode {
    getOrganizationByCode(
        collection: "organization"
        organizationCode: "Midhani"
        tenantCode: "Midhani"
    ) {
        location {
            locationCode
            locationName
        }
    }
}

    `;

    console.log("token tokentokentokentoken", token);
        // Send the request using fetch
      //  fetch('http://192.168.1.11:8000/graphql', { // Replace '/graphql' with your GraphQL API endpoint
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, { // Replace '/graphql' with your GraphQL API endpoint
            method: 'POST',
            headers: createHeaders(token),
            mode: "cors",
            credentials: "include",
            body: JSON.stringify({ query })

        })

            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("data", data);
                console.log("data", data.data.getOrganizationByCode.location);
                // Extract the location codes and names from the data
                if (data?.data?.getOrganizationByCode?.location) {
                    const locationData = data.data.getOrganizationByCode.location.map((loc: { locationCode: string, locationName: string }) => ({
                        code: loc.locationCode,
                        name: loc.locationName
                    }));
                    setLocations(locationData);
                    console.log("locationData", locationData);
                } else {
                    setError('No location data found');
                }
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
                setError(`Failed to fetch locations: ${error.message}`);
            })
            .finally(() => {
                setLoadingLocations(false);
            });
    }, [token, tokenLoading]);
    console.log("selectedLocation", selectedLocation);

    
      // Subsidiaries data using useRequest hook
      const {
          data: subsidiariesData,
          loading: loadingSubsidiaries,
          error: subsidiariesError,
          refetch: fetchSubsidiariesData
      } = useRequest<any[]>({
          url: 'muster/liveAttendance/search',
          method: 'POST',
          data: [
              {
                  "field": "attendanceDate",
                  "operator": "eq",
                  "value": "23-07-2025"
              },
              {
                  "field": "deployment.location.locationCode",
                  "operator": "eq",
                  "value": selectedLocation
              }
          ],
          onSuccess: (result) => {
              console.log('Subsidiaries data result:', result);
              // Process the result to extract unique subsidiaries
              if (result && Array.isArray(result)) {
                  const seen = new Set();
                  const unique = result
                      .map((entry: any) => entry.deployment?.subsidiary)
                      .filter((sub: any) => {
                          if (!sub) return false;
                          const key = sub.subsidiaryCode;
                          return seen.has(key) ? false : seen.add(key);
                      });
                  console.log("Subsidiaries unique", unique);
                  setUniqueSubsidiaries(unique);
              }
          },
          onError: (error) => {
              console.error('Error fetching subsidiaries data:', error);
              setError(`Failed to fetch subsidiaries: ${error.message}`);
          },
          dependencies: [selectedLocation, token]
      });

    // Divisions data using useRequest hook
    const {
        data: divisionsData,
        loading: loadingDivisions,
        error: divisionsError,
        refetch: fetchDivisionsData
    } = useRequest<any[]>({
        url: 'muster/liveAttendance/search',
        method: 'POST',
        data: [
            {
                "field": "attendanceDate",
                "operator": "eq",
                "value": "23-07-2025"
            },
            {
                "field": "deployment.location.locationCode",
                "operator": "eq",
                "value": selectedLocation
            },
            {
                "field": "deployment.subsidiary.subsidiaryCode",
                "operator": "eq",
                "value": selectedName
            }
        ],
        onSuccess: (result) => {
            console.log('Divisions data result:', result);
            // Process the result to extract unique divisions
            if (result && Array.isArray(result)) {
                const seen = new Set();
                const unique = result
                    .map((entry: any) => entry.deployment?.division)
                    .filter((div: any) => {
                        if (!div) return false;
                        const key = div.divisionCode;
                        return seen.has(key) ? false : seen.add(key);
                    });
                console.log("Divisions unique", unique);
                setUniqueDivisions(unique);
            }
        },
        onError: (error) => {
            console.error('Error fetching divisions data:', error);
            setError(`Failed to fetch divisions: ${error.message}`);
        },
        dependencies: [selectedLocation, selectedName, token]
    });

    // Departments data using useRequest hook
    const {
        data: departmentsData,
        loading: loadingDepartments,
        error: departmentsError,
        refetch: fetchDepartmentsData
    } = useRequest<any[]>({
        url: 'muster/liveAttendance/search',
        method: 'POST',
        data: [
            {
                "field": "attendanceDate",
                "operator": "eq",
                "value": "23-07-2025"
            },
            {
                "field": "deployment.location.locationCode",
                "operator": "eq",
                "value": selectedLocation
            },
            {
                "field": "deployment.subsidiary.subsidiaryCode",
                "operator": "eq",
                "value": selectedName
            },
            {
                "field": "deployment.division.divisionCode",
                "operator": "eq",
                "value": selectedNamediv
            }
        ],
        onSuccess: (result) => {
            console.log('Departments data result:', result);
            // Process the result to extract unique departments
            if (result && Array.isArray(result)) {
                const seen = new Set();
                const unique = result
                    .map((entry: any) => entry.deployment?.department)
                    .filter((dept: any) => {
                        if (!dept) return false;
                        const key = dept.departmentCode;
                        return seen.has(key) ? false : seen.add(key);
                    });
                console.log("Departments unique", unique);
                setUniqueDepartments(unique);
            }
        },
        onError: (error) => {
            console.error('Error fetching departments data:', error);
            setError(`Failed to fetch departments: ${error.message}`);
        },
        dependencies: [selectedLocation, selectedName, selectedNamediv, token]
    });

    // Call fetchSubsidiariesData when selectedLocation changes
    useEffect(() => {
        if (selectedLocation && token && !tokenLoading) {
            fetchSubsidiariesData();
        }
    }, [selectedLocation, fetchSubsidiariesData, token, tokenLoading]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <main className="flex flex-1 flex-col gap-2 p-0 md:gap-4 md:p-4">

                {/* Show loading state when token is loading */}
                {tokenLoading && (
                    <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-blue-600 font-medium">Loading authentication...</span>
                        </div>
                    </div>
                )}

                {/* Show error state if token error */}
                {tokenError && (
                    <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <span className="text-red-600 font-medium">Authentication error: {tokenError.message}</span>
                    </div>
                )}

                {/* Show general error state */}
                {error && (
                    <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <span className="text-red-600 font-medium">{error}</span>
                    </div>
                )}

                {/* Only show content if token is available and not loading */}
                {!tokenLoading && token && (
                    <>
                        {loadingLocations && (
                            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-blue-600 font-medium">Loading locations...</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <Select onValueChange={handleLocationChange} disabled={!token || tokenLoading || loadingLocations}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder={
                                        tokenLoading ? "Loading..." : 
                                        loadingLocations ? "Loading locations..." : 
                                        "Select Location"
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((location, index) => (
                                        <SelectItem key={index} value={location.code}>{location.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            {selectedLocation && (
                                <Button 
                                    onClick={handleManualRefresh} 
                                    disabled={isRefreshing || !token || tokenLoading || loadingSubsidiaries || loadingDivisions || loadingDepartments}
                                    variant="outline" 
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            )}
                        </div>

                {selectedLocation && (
                    <>
                        {isRefreshing && (
                            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-blue-600 font-medium">Refreshing data for {locations.find(loc => loc.code === selectedLocation)?.name}...</span>
                                </div>
                            </div>
                        )}

                        <PresentAbsentLocationSelection 
                            name={selectedLocation} 
                            hierarchyLevel="location"
                            key={`present-${refreshKey}`} 
                        />

                        <div className="flex flex-col items-center">
                            {loadingSubsidiaries ? (
                                <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                        <span className="text-yellow-600 font-medium">Loading subsidiaries...</span>
                                    </div>
                                </div>
                            ) : uniqueSubsidiaries.length > 0 ? (
                                <>
                                    <div className="relative w-full max-w-xs">
                                        <Carousel 
                                            opts={{
                                                align: "start",
                                                loop: false,
                                            }}
                                            className="w-full"
                                        >
                                            <CarouselContent className="-ml-1">
                                                {uniqueSubsidiaries.map((subsidiary, index) => (
                                                    <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                                                        <div className="p-1">
                                                            <button
                                                                onClick={() => handleSubsidiarySelection(subsidiary.subsidiaryCode)}
                                                                className="w-full text-left rounded-xl shadow hover:shadow-lg transition"
                                                            >
                                                                <Card>
                                                                    <CardContent className="flex aspect-square items-center justify-center p-4">
                                                                        <span className="text-sm font-semibold text-center leading-tight">{subsidiary.subsidiaryName || subsidiary.subsidiaryCode}</span>
                                                                    </CardContent>
                                                                </Card>
                                                            </button>
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious />
                                            <CarouselNext />
                                        </Carousel>
                                    </div>
                                    {selectedName && (
                                        <>
                                            <div className="mt-6 w-full">
                                                <PresentAbsentLocationSelection 
                                                    name={selectedName} 
                                                    hierarchyLevel="subsidiary"
                                                    parentLocation={selectedLocation}
                                                    key={`present-subsidiary-${refreshKey}`} 
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                                    <span className="text-gray-500">No subsidiaries found for this location</span>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {selectedName && (loadingDivisions ? (
                    <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                            <span className="text-yellow-600 font-medium">Loading divisions...</span>
                        </div>
                    </div>
                ) : uniqueDivisions.length > 0) && (
                    <div className="flex flex-col items-center">
                        <div className="relative w-full max-w-xs">
                            <Carousel 
                                opts={{
                                    align: "start",
                                    loop: false,
                                }}
                                className="w-full"
                            >
                                <CarouselContent className="-ml-1">
                                    {uniqueDivisions.map((division, index) => (
                                        <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                                            <div className="p-1">
                                                <button
                                                    onClick={() => handleDivisionSelection(division.divisionCode)}
                                                    className="w-full text-left rounded-xl shadow hover:shadow-lg transition"
                                                >
                                                    <Card>
                                                        <CardContent className="flex aspect-square items-center justify-center p-4">
                                                            <span className="text-sm font-semibold text-center leading-tight">{division.divisionName || division.divisionCode}</span>
                                                        </CardContent>
                                                    </Card>
                                                </button>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        </div>
                        {selectedNamediv && (
                            <>
                                <div className="mt-6 w-full">
                                    <PresentAbsentLocationSelection 
                                        name={selectedNamediv} 
                                        hierarchyLevel="division"
                                        parentLocation={selectedLocation}
                                        parentSubsidiary={selectedName}
                                        key={`present-division-${refreshKey}`} 
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {selectedNamediv && (
                    <div className="flex flex-col items-center">
                        {loadingDepartments ? (
                            <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                    <span className="text-yellow-600 font-medium">Loading departments...</span>
                                </div>
                            </div>
                        ) : uniqueDepartments.length > 0 ? (
                            <>
                                <div className="relative w-full max-w-xs">
                                    <Carousel 
                                        opts={{
                                            align: "start",
                                            loop: false,
                                        }}
                                        className="w-full"
                                    >
                                        <CarouselContent className="-ml-1">
                                            {uniqueDepartments.map((department, index) => (
                                                <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                                                    <div className="p-1">
                                                        <button
                                                            onClick={() => setSelectedNamedept(department.departmentCode)}
                                                            className="w-full text-left rounded-xl shadow hover:shadow-lg transition"
                                                        >
                                                            <Card>
                                                                <CardContent className="flex aspect-square items-center justify-center p-4">
                                                                    <span className="text-sm font-semibold text-center leading-tight">{department.departmentName || department.departmentCode}</span>
                                                                </CardContent>
                                                            </Card>
                                                        </button>
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </Carousel>
                                </div>
                                {selectedNamedept && (
                                    <>
                                        <div className="mt-6 w-full">
                                            <PresentAbsentLocationSelection 
                                                name={selectedNamedept} 
                                                hierarchyLevel="department"
                                                parentLocation={selectedLocation}
                                                parentSubsidiary={selectedName}
                                                parentDivision={selectedNamediv}
                                                key={`present-department-${refreshKey}`} 
                                            />
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-gray-500">No departments found for this division</span>
                            </div>
                        )}
                    </div>
                )}
                    </>
                )}

            </main>
        </div>
    )


}

