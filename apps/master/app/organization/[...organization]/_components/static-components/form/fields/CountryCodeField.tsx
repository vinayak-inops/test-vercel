"use client"

import { useState } from "react"
import { UseFormSetValue, UseFormWatch, FieldError } from "react-hook-form"
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@repo/ui/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover"
import { cn } from "@repo/ui/utils/shadcnui/cn"

interface CountryCodeFieldProps {
  setValue: UseFormSetValue<any>
  watch: UseFormWatch<any>
  error?: FieldError
  countryOptions: Array<{ 
    countryCode: string
    countryName: string
    id: string
    status: string
  }>
}

export default function CountryCodeField({ 
  setValue, 
  watch, 
  error, 
  countryOptions 
}: CountryCodeFieldProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  
  const selectedCountryCode = watch("countryCode")

  const handleCountrySelect = (value: string) => {
    setValue("countryCode", value, { shouldValidate: true })
    // Reset state when country changes
    setValue("stateCode", "", { shouldValidate: true })
    setSearchValue("")
    setDropdownOpen(false)
  }

  // Filter active countries and create display options
  const activeCountries = countryOptions.filter(country => country.status === 'active')
  const displayOptions = activeCountries.map(country => ({
    label: `${country.countryName} (${country.countryCode})`,
    value: country.countryCode
  }))

  const filteredCountryOptions = displayOptions.filter((option: any) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <div className="space-y-2 bg-white p-0 rounded-lg">
      <label className="text-sm font-medium text-gray-700">
        Country
      </label>
      {activeCountries.length === 0 ? (
        <div className="w-full px-3 py-2 rounded-md border border-red-300 bg-red-50 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Please add Country Code in proper way
        </div>
      ) : (
        <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <PopoverTrigger className="w-full bg-white" asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={dropdownOpen}
              className={`w-full justify-between h-10 ${
                error
                  ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            >
              {selectedCountryCode ? (
                displayOptions.find((opt: any) => opt.value === selectedCountryCode)?.label || selectedCountryCode
              ) : (
                <span className="text-gray-500">Select Country</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white max-h-none">
            <Command className="max-h-none">
              <CommandInput 
                placeholder="Search Country..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup className="max-h-none overflow-visible">
                {filteredCountryOptions?.map((option: any) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleCountrySelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCountryCode === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  )
}