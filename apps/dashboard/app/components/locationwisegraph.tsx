"use client";

import React, { useEffect, useState } from "react"
import LiveDataGraph from "../components/livedatagraph";
import PresentAbsent from "../components/presentabsent";
import LiveDataGraphLocationWise from "../components/LiveDataGraphlocationwise";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent } from "@repo/ui/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import LiveDataGraphLocationSelection from "./LiveDataGraphlocationselection";
import PresentAbsentLocationSelection from "./PresentAbsentlocationselection";


export default function LocationWiseGraph() {
    const [value, setValue] = useState("")
    const [selectedName, setSelectedName] = useState("");
    const [selectedNamediv, setSelectedNamediv] = useState("");
    const [selectedNamedept, setSelectedNamedept] = useState("");
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState("");
    const names = ["sub1", "sub2", "sub3", "sub4", "sub5"];
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

    const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJQeUt3ZW1kT1RPeVFnLTR0TjRHT1lBdFhMTEl1dmNGd3hGWTJFY29IQzRJIn0.eyJleHAiOjE3NTMzNjI3NDEsImlhdCI6MTc1MzMyNjc0MSwianRpIjoidHJydGNjOjFjZTIzZjBkLWM3NDYtZWNlMi1hNThlLTgyOTkwMGIwY2YyYiIsImlzcyI6Imh0dHA6Ly8xMjIuMTY2LjI0NS45Nzo4MDgwL3JlYWxtcy9pbm9wcyIsImF1ZCI6WyJyZWFsbS1tYW5hZ2VtZW50IiwiYWNjb3VudCJdLCJzdWIiOiJiNTRiN2UxZS0xMzY3LTQwZWItYjhmZS02ODMxY2ZjNTMzY2IiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJnYXRld2F5LWNsaWVudCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImFkbWluIiwiZGVmYXVsdC1yb2xlcy1pbm9wcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsInZpZXctcmVhbG0iLCJ2aWV3LXVzZXJzIiwicXVlcnktY2xpZW50cyIsInF1ZXJ5LWdyb3VwcyIsInF1ZXJ5LXVzZXJzIl19LCJnYXRld2F5LWNsaWVudCI6eyJyb2xlcyI6WyJhZG1pbiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctYXBwbGljYXRpb25zIiwidmlldy1jb25zZW50Iiwidmlldy1ncm91cHMiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsImRlbGV0ZS1hY2NvdW50IiwibWFuYWdlLWNvbnNlbnQiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9yZ2FuaXphdGlvbiBwcm9maWxlIGVtYWlsIiwiY2xpZW50SG9zdCI6IjE3Mi4yNS4wLjEiLCJhZGRyZXNzIjp7fSwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJncm91cHMiOlsib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsImRlZmF1bHQtcm9sZXMtaW5vcHMiLCJ1bWFfYXV0aG9yaXphdGlvbiJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtZ2F0ZXdheS1jbGllbnQiLCJjbGllbnRBZGRyZXNzIjoiMTcyLjI1LjAuMSIsImNsaWVudF9pZCI6ImdhdGV3YXktY2xpZW50In0.snjY2NIqFZm0vp_9hMpPsoXXLT6UWUzfOYkKNfnu_XeJ-DWwqS0iAEZCbMUTTM2eUzAyUOriwMG3vkxUSjWn6hhfgUmzFLVL-PnrwkG5x4J5qqaUMTQArNo4y4ZMcGRMDRPEMAeGI4l42tbBSuW35GkXzWtkrb6a4IR44B6a1JHYscNq9UF15FAaWn4jl-xVm2pyrJJQeZxB4IOww_q_tmbe_9QPuSrhTpQR9RPLOBj9brTvgw1D0uMEsSKrWWE6tFpe1dqnNncU8IxmjIZHLVsfTuz0GkxRdzv49T01LMtLGf6RDkGbpQYnXjqGuOHnBTKBZsGkxceBd8x8jKo6Hw";

    useEffect(() => {
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

        // Send the request using fetch
        fetch('http://192.168.1.11:8000/graphql', { // Replace '/graphql' with your GraphQL API endpoint
        //fetch('http://122.166.245.97:8086/graphql', { // Replace '/graphql' with your GraphQL API endpoint
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

            .then(res => res.json())
            .then(data => {
                console.log("data", data);
                console.log("data", data.data.getOrganizationByCode.location);
                // Extract the location names from the data
                if (data?.data?.getOrganizationByCode?.location) {
                    const locationNames = data.data.getOrganizationByCode.location.map((loc: { locationName: string }) => loc.locationName);
                    setLocations(locationNames);
                    console.log("locationNames",locationNames);
                }
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
            });
    }, []);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <main className="flex flex-1 flex-col gap-2 p-0 md:gap-4 md:p-4">

                <Select onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map((location, index) => (
                            <SelectItem key={index} value={location}>{location}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>


                {selectedLocation && (
                    <>

                        <PresentAbsentLocationSelection name={selectedLocation} />
                        <LiveDataGraphLocationSelection name={selectedLocation} />

                        <div className="flex flex-col items-center">
                            <Carousel className="w-full max-w-xs content-start">
                                <CarouselContent className="-ml-1">
                                    {/* <div className="flex flex-wrap gap-4"> */}
                                    {names.map((name, index) => (
                                        // {Array.from({ length: 5 }).map((_, index) => (
                                        <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                                            <div className="p-1">
                                                <button
                                                    onClick={() => setSelectedName(name)}
                                                    className="w-full text-left rounded-xl shadow hover:shadow-lg transition"
                                                >
                                                    <Card>
                                                        <CardContent className="flex aspect-square items-center justify-center p-6">
                                                            <span className="text-2xl font-semibold">{name}</span>
                                                        </CardContent>
                                                    </Card>
                                                </button>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                    {/* </div> */}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                            {selectedName && (
                                <div className="mt-6 w-full max-w-2xl">
                                    <LiveDataGraphLocationWise name={selectedName} />
                                </div>
                            )}
                        </div>
                    </>
                )}

                {selectedName && (
                    <div className="flex flex-col items-center">
                        <Carousel className="w-full max-w-xs content-start">
                            <CarouselContent className="-ml-1">
                                {/* <div className="flex flex-wrap gap-4"> */}
                                {namesdiv.map((name, index) => (
                                    // {Array.from({ length: 5 }).map((_, index) => (
                                    <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                                        <div className="p-1">
                                            <button
                                                onClick={() => setSelectedNamediv(name)}
                                                className="w-full text-left rounded-xl shadow hover:shadow-lg transition"
                                            >
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-6">
                                                        <span className="text-2xl font-semibold">{name}</span>
                                                    </CardContent>
                                                </Card>
                                            </button>
                                        </div>
                                    </CarouselItem>
                                ))}
                                {/* </div> */}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                        {selectedNamediv && (
                            <div className="mt-6 w-full max-w-2xl">
                                <LiveDataGraphLocationWise name={selectedNamediv} />
                            </div>
                        )}
                    </div>
                )}

                {selectedNamediv && (
                    <div className="flex flex-col items-center">
                        <Carousel className="w-full max-w-xs content-start">
                            <CarouselContent className="-ml-1">
                                {/* <div className="flex flex-wrap gap-4"> */}
                                {namesdept.map((name, index) => (
                                    // {Array.from({ length: 5 }).map((_, index) => (
                                    <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                                        <div className="p-1">
                                            <button
                                                onClick={() => setSelectedNamedept(name)}
                                                className="w-full text-left rounded-xl shadow hover:shadow-lg transition"
                                            >
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-6">
                                                        <span className="text-2xl font-semibold">{name}</span>
                                                    </CardContent>
                                                </Card>
                                            </button>
                                        </div>
                                    </CarouselItem>
                                ))}
                                {/* </div> */}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                        {selectedNamedept && (
                            <div className="mt-6 w-full max-w-2xl">
                                <LiveDataGraphLocationWise name={selectedNamedept} />
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    )


}

