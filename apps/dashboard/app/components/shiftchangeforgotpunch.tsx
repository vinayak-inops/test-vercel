"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function ShiftChangeForgotPunch() {
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

    return (
        <div className="p-0 space-y-6 bg-gray-50 ">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                           <Card className="w-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-medium text-gray-700">Shift Change</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Select onValueChange={(value) => handleInputChange("category", value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">xxx</SelectItem>
                                        <SelectItem value="support">abc</SelectItem>
                                        <SelectItem value="sales">ccc</SelectItem>
                                        <SelectItem value="partnership">ddd</SelectItem>
                                        <SelectItem value="other">eee</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder="From Date"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="To Date"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder="Shift Code"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange("location", e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            {/* <div className="space-y-2">
                                <Textarea
                                    placeholder="Message"
                                    value={formData.message}
                                    onChange={(e) => handleInputChange("message", e.target.value)}
                                    className="w-full min-h-[100px] resize-none"
                                />
                            </div> */}

                            <Button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
                            >
                                {/* <ArrowRight className="w-4 h-4 mr-2" /> */}
                                Submit
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-medium text-gray-700">Forgot Punch</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Select onValueChange={(value) => handleInputChange("category", value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">abc</SelectItem>
                                        <SelectItem value="support">mmm</SelectItem>
                                        <SelectItem value="sales">www</SelectItem>
                                        <SelectItem value="partnership">sss</SelectItem>
                                        <SelectItem value="other">ggg</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder="Date"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="Inpunch"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder="Outpunch"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange("location", e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            {/* <div className="space-y-2">
                                <Textarea
                                    placeholder="Message"
                                    value={formData.message}
                                    onChange={(e) => handleInputChange("message", e.target.value)}
                                    className="w-full min-h-[100px] resize-none"
                                />
                            </div> */}

                            <Button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
                            >
                                {/* <ArrowRight className="w-4 h-4 mr-2" /> */}
                                Submit
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>

    )

}
