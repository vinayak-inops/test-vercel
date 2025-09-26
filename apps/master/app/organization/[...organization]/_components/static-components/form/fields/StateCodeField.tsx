"use client"

import { useState, useMemo } from "react"
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

interface StateCodeFieldProps {
  setValue: UseFormSetValue<any>
  watch: UseFormWatch<any>
  error?: FieldError
  stateOptions: Array<{
    countryCode: string
    stateCode: string
    stateName: string
    region: string
  }>
}

// Named export version
export function StateCodeField({ 
  setValue, 
  watch, 
  error, 
  stateOptions 
}: StateCodeFieldProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  
  const selectedStateCode = watch("stateCode")
  const selectedCountryCode = watch("countryCode")

  const handleStateSelect = (value: string) => {
    setValue("stateCode", value, { shouldValidate: true })
    setSearchValue("")
    setDropdownOpen(false)
  }

  // Filter states based on selected country
  const availableStates = useMemo(() => {
    if (!selectedCountryCode) return []
    
    return stateOptions
      .filter(state => {
        // Match country code (handle both formats like "IN" and "INA")
        return state.countryCode === selectedCountryCode || 
               state.countryCode === selectedCountryCode.substring(0, 2) ||
               selectedCountryCode.startsWith(state.countryCode)
      })
      .map(state => ({
        label: `${state.stateName} (${state.stateCode}) - ${state.region}`,
        value: state.stateCode,
        stateName: state.stateName
      }))
  }, [stateOptions, selectedCountryCode])

  const filteredStateOptions = availableStates.filter((option: any) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  )

  const isDisabled = !selectedCountryCode

  return (
    <div className="space-y-2 bg-white p-0 rounded-lg">
      <label className="text-sm font-medium text-gray-700">
        State
      </label>
      {isDisabled ? (
        <div className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 text-sm text-gray-500 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Please select a country first
        </div>
      ) : availableStates.length === 0 ? (
        <div className="w-full px-3 py-2 rounded-md border border-red-300 bg-red-50 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          No states available for selected country
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
              disabled={isDisabled}
            >
              {selectedStateCode ? (
                availableStates.find((opt: any) => opt.value === selectedStateCode)?.stateName || selectedStateCode
              ) : (
                <span className="text-gray-500">Select State</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white max-h-none">
            <Command className="max-h-none">
              <CommandInput 
                placeholder="Search State..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup className="max-h-none overflow-visible">
                {filteredStateOptions?.map((option: any) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleStateSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedStateCode === option.value
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

// Default export version (keep this for backward compatibility)
export default StateCodeField