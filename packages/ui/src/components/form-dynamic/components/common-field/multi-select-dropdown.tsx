"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Check, X, ChevronDown, Search } from "lucide-react";
import { cn } from "../../../../utils/shadcnui/cn";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { useWatch } from "react-hook-form";
import { useFormContext } from "../../../../context/FormContext";
import React from "react";
import { useValueFiltration } from "../../../../hooks/form-dynamic/valuefilteration/useValueFiltration";
import { useFieldVisibility } from "../../../../hooks/form-dynamic/valuefilteration/useFieldVisibility";

interface Option {
  value: string;
  label: string;
}

interface Field {
  name: string;
  label: string;
  required?: boolean;
  options?: Option[];
  classvalue?: {
    container?: string;
  };
  onChange?: Array<{
    event: string;
    children?: string[];
  }>;
  functions?: Array<{
    function: string;
    storageName?: string;
    storageValue?: string[];
  }>;
}

interface MultiSelectDropdownProps {
  field: any;
  tag: string;
  fields: any;
}

const MultiSelectDropdown = React.memo(
  ({ field, tag, fields }: MultiSelectDropdownProps) => {
    const {
      register,
      errors,
      setValue,
      control,
      fromValue,
      watch,
      fieldUpdateControl,
      onFieldUpdate,
      setMessenger,
      messenger,
      clearErrors
    } = useFormContext();

    console.log("messengermessengermessengermessenger",messenger.organizationData);

    // State management
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [options, setOptions] = useState<any[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const initializedRef = useRef<Set<string>>(new Set());

    const { filterParentValue } = useValueFiltration({ 
      fieldUpdateControl, 
      watch,
      filteredDataCall: {}, 
      setValue,
      messenger
    });

    console.log("fieldfieldfieldfield",messenger);

    // Memoize watched value
    const watchedValue = useWatch({
      control,
      name: field.name,
      defaultValue: [],
    });

    // Use watchedValue directly as the source of truth for selected items
    const selectedItems = useMemo(() => {
      console.log(`🔄 ${field.name} - selectedItems calculation:`, {
        watchedValue,
        isInitialized: initializedRef.current.has(field.name),
        fromValueData: fromValue?.forlocaluse?.[field.name]
      });

      // Always use watchedValue as the single source of truth
      if (Array.isArray(watchedValue) && watchedValue.length > 0) {
        console.log(`✅ ${field.name} - Using watchedValue:`, watchedValue);
        return watchedValue;
      }
      if (typeof watchedValue === "string" && watchedValue) {
        console.log(`✅ ${field.name} - Using string watchedValue:`, [watchedValue]);
        return [watchedValue];
      }
      
      // Only use fromValue for initial display if field hasn't been initialized yet
      if (!initializedRef.current.has(field.name)) {
        const fromValueData = fromValue?.forlocaluse?.[field.name];
        if (fromValueData && (Array.isArray(fromValueData) ? fromValueData.length > 0 : true)) {
          if (Array.isArray(fromValueData)) {
            console.log(`📋 ${field.name} - Using fromValue (not initialized):`, fromValueData);
            return fromValueData;
          } else if (typeof fromValueData === 'string') {
            console.log(`📋 ${field.name} - Using string fromValue (not initialized):`, [fromValueData]);
            return [fromValueData];
          } else {
            console.log(`📋 ${field.name} - Using converted fromValue (not initialized):`, [String(fromValueData)]);
            return [String(fromValueData)];
          }
        }
      }
      
      // Default: Empty array
      console.log(`❌ ${field.name} - No value available, returning empty array`);
      return [];
    }, [watchedValue, field.name]); // Remove fromValue dependency to prevent conflicts

    // Initialize form value from fromValue only if watch is completely empty
    useEffect(() => {
      if (!field?.name) return;

      // Check if this field has already been initialized
      if (initializedRef.current.has(field.name)) {
        return;
      }

      // First check: Does watch have a value?
      const currentWatchValue = watch(field.name);
      if (currentWatchValue && (Array.isArray(currentWatchValue) ? currentWatchValue.length > 0 : true)) {
        console.log(`✅ ${field.name} - Watch already has value:`, currentWatchValue);
        initializedRef.current.add(field.name);
        return;
      }

      // Second check: Does fromValue have data for this field?
      const fromValueData = fromValue?.forlocaluse?.[field.name];
      if (fromValueData && (Array.isArray(fromValueData) ? fromValueData.length > 0 : true)) {
        let valueToSet: string[] = [];
        
        if (Array.isArray(fromValueData)) {
          valueToSet = fromValueData;
        } else if (typeof fromValueData === 'string') {
          valueToSet = [fromValueData];
        } else {
          valueToSet = [String(fromValueData)];
        }
        
        console.log(`🔄 ${field.name} - Watch empty, initializing from fromValue:`, valueToSet);
        
        // Mark as initialized immediately to prevent multiple calls
        initializedRef.current.add(field.name);
        
        // Set the value directly without setTimeout to prevent blinking
        setValue(field.name, valueToSet, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      } else {
        // Mark as initialized even if no data available
        initializedRef.current.add(field.name);
        console.log(`❌ ${field.name} - No data available in watch or fromValue`);
      }
    }, [field?.name, fromValue?.forlocaluse, watch, setValue]);

    // Reset initialization when field name changes (for different forms/pages)
    useEffect(() => {
      if (field?.name) {
        initializedRef.current.delete(field.name);
      }
    }, [field?.name]);

    // Utility to get parent field for any field
    const parentFieldMap: Record<string, string> = {
      subsidiaries: "",
      divisions: "subsidiaries",
      departments: "divisions",
      subDepartments: "departments",
      sections: "subDepartments",
      designations: "divisions",
      location: "",
      grades: "designations"
    };
    const getParentField = (fieldName: string) => parentFieldMap[fieldName];

    // --- Ensure dropdown updates when parent value changes ---
    // Find the parent field for this field
    const parentField = getParentField(field.name);
    // Use useWatch to get the parent value (triggers re-render on change)
    const parentValue = parentField ? useWatch({ control, name: parentField, defaultValue: undefined }) : undefined;

    // Validation: Disable dropdown if parent is not selected
    const isFieldValid = useCallback(() => {
      if (!parentField) return true;
      if (parentValue && Array.isArray(parentValue) && parentValue.length > 0) {
        return true;
      }
      const parentFromValue = fromValue?.forlocaluse?.[parentField];
      if (parentFromValue && (Array.isArray(parentFromValue) ? parentFromValue.length > 0 : true)) {
        return true;
      }
      // Check if field is hidden
      const isHidden = messenger?.mode?.some(
        (item: any) => item.field === field.name && item.value === "hidden"
      );
      return isHidden;
    }, [parentField, parentValue, fromValue, messenger?.mode, field.name]);
    const fieldIsValid = isFieldValid();

    // Memoize filtered options for this field, including parentValue in dependencies
    const filteredOptions = useMemo(
      () => filterParentValue(field.name),
      [filterParentValue, field.name, messenger?.mode, parentValue]
    );
    const availableOptions = useMemo(
      () => filteredOptions[field.name] || [],
      [filteredOptions, field.name]
    );

    // Memoize filtered items based on search with performance optimization
    const filteredItems = useMemo(() => {
      if (!searchValue.trim()) {
        return availableOptions;
      }
      
      const searchLower = searchValue.toLowerCase();
      return availableOptions.filter((item: any) =>
        item?.label?.toLowerCase().includes(searchLower)
      );
    }, [availableOptions, searchValue]);

    // Update options when filtered items change
    useEffect(() => {
      setOptions(filteredItems);
    }, [filteredItems]);

    // Register field with validation
    useEffect(() => {
      if (!field?.name) {
        console.warn('Field name is undefined');
        return;
      }

      try {
        register(field.name, {
          required: field.required ? "This field is required" : false,
          validate: (value: any) => {
            if (field.required && (!Array.isArray(value) || value.length === 0)) {
              return "Please select at least one item";
            }
            return true;
          }
        });
      } catch (error) {
        console.warn('Error registering field:', error);
      }
    }, [field?.name, field?.required, register]);

    // Cleanup search timeout on unmount
    useEffect(() => {
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, [searchTimeoutRef]);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Memoize handlers
    const handleItemToggle = useCallback((value: string) => {
      if (!field?.name) {
        console.warn('Field name is undefined');
        return;
      }

      try {
        const currentArray = Array.isArray(watchedValue) ? [...watchedValue] : [];
        const isCurrentlySelected = currentArray.includes(value);
        const newItems = isCurrentlySelected
          ? currentArray.filter((v) => v !== value)
          : [...currentArray, value];

        console.log("Item toggled:", value, "Current:", currentArray, "New:", newItems);

        // Update form state immediately
        setValue(field.name, newItems, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        
        // Call onFieldUpdate if provided
        onFieldUpdate?.(field.name, newItems);
        
        // Clear errors if we have items selected
        if (newItems.length > 0) {
          clearErrors(field.name);
        }
      } catch (error) {
        console.warn('Error toggling item:', error);
      }
    }, [field?.name, setValue, onFieldUpdate, watchedValue, clearErrors]);

    const handleSelectAllToggle = useCallback(() => {
      if (!field?.name) {
        console.warn('Field name is undefined');
        return;
      }

      try {
        const allValues = availableOptions.map((i: any) => i.value);
        const currentArray = Array.isArray(watchedValue) ? [...watchedValue] : [];
        const allSelected = currentArray.length === allValues.length;
        const newItems = allSelected ? [] : allValues;

        console.log("Select all toggled. Current:", currentArray, "New:", newItems);

        // Update form state immediately
        setValue(field.name, newItems, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        
        // Call onFieldUpdate if provided
        onFieldUpdate?.(field.name, newItems);
        
        // Clear errors if we have items selected
        if (newItems.length > 0) {
          clearErrors(field.name);
        }
      } catch (error) {
        console.warn('Error toggling select all:', error);
      }
    }, [availableOptions, field?.name, setValue, onFieldUpdate, watchedValue, clearErrors]);

    const handleButtonClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Only allow opening if field is valid
      if (!fieldIsValid) {
        return;
      }
      
      setIsOpen((prev) => !prev);
    }, [fieldIsValid]);

    const handleItemClick = useCallback((e: React.MouseEvent, value: string) => {
      e.preventDefault();
      e.stopPropagation();
      handleItemToggle(value);
    }, [handleItemToggle]);

    const handleSelectAllClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleSelectAllToggle();
    }, [handleSelectAllToggle]);

    const handleRemoveItem = useCallback((e: React.MouseEvent, value: string) => {
      e.preventDefault();
      e.stopPropagation();
      handleItemToggle(value);
    }, [handleItemToggle]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      const value = e.target.value;
      
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Debounce search to prevent excessive filtering
      searchTimeoutRef.current = setTimeout(() => {
        setSearchValue(value);
      }, 150);
    }, []);

    // Memoize item label getter
    const getItemLabel = useCallback((value: string) => {
      const item = availableOptions.find((i: any) => i.value === value);
      return item?.label || value;
    }, [availableOptions]);

    // Effect: When parent value changes, filter out invalid selected items and clear if parent is cleared
    useEffect(() => {
      const parentField = getParentField(field.name);
      if (!parentField) return; // No parent, nothing to do
      const parentValue = watch(parentField);
      const available = filterParentValue(field.name)[field.name] || [];
      const validSelectedItems = selectedItems.filter((item: string) => available.some((opt: any) => opt.value === item));
      // If any selected item is no longer valid, update the field value
      if (selectedItems.length > 0 && validSelectedItems.length !== selectedItems.length) {
        setValue(field.name, validSelectedItems, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        onFieldUpdate?.(field.name, validSelectedItems);
      }
      // If parent is cleared, also clear this field
      if ((Array.isArray(parentValue) && parentValue.length === 0) || (!Array.isArray(parentValue) && !parentValue)) {
        if (selectedItems.length > 0) {
          setValue(field.name, [], {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
          onFieldUpdate?.(field.name, []);
        }
      }
    }, [field.name, filterParentValue, watch, selectedItems, setValue, onFieldUpdate]);

    return (
      <div className={`w-full ${field?.classvalue?.container}`}>
        <div className="relative" ref={dropdownRef}>
          <label
            htmlFor={`${field.name}-dropdown`}
            className={cn(
              "block text-sm font-medium mb-1.5",
              fieldIsValid ? "text-gray-700" : "text-gray-400"
            )}
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
            {!fieldIsValid && (
              <span className="text-xs text-gray-400 ml-2 font-normal">
                (Select parent first)
              </span>
            )}
          </label>
          <Button
            id={`${field.name}-dropdown`}
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-between bg-white border border-gray-200 rounded-lg shadow-sm",
              "hover:border-gray-300 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
              "transition-all duration-200 cursor-pointer",
              isOpen && "border-blue-500 ring-2 ring-blue-500 shadow-lg",
              !fieldIsValid && "opacity-50 blur-[0.5px] cursor-not-allowed bg-gray-100",
              field?.classvalue?.field
            )}
            onClick={handleButtonClick}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            disabled={!fieldIsValid}
          >
            <span
              className={cn(
                "truncate font-medium",
                !selectedItems.length ? "text-gray-500" : "text-gray-900",
                !fieldIsValid && "text-gray-400"
              )}
            >
              {!fieldIsValid 
                ? "Select parent first..."
                : selectedItems.length > 0
                ? `${selectedItems.length} item${selectedItems.length > 1 ? "s" : ""} selected`
                : "Select items..."
              }
            </span>
            <div className="flex items-center gap-2">
              {selectedItems.length > 0 && fieldIsValid && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  isOpen ? "transform rotate-180" : "",
                  !fieldIsValid && "text-gray-400"
                )}
              />
            </div>
          </Button>

          {isOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsOpen(false);
                }
              }}
            >
              <div
                className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 max-h-[80vh] overflow-hidden"
                role="listbox"
                aria-multiselectable="true"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{field.label}</h3>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedItems.length > 0 
                      ? `${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} selected`
                      : 'Select one or more items'
                    }
                  </p>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Search items..."
                      value={searchValue}
                      onChange={handleSearchChange}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-64">
                  {options?.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="text-gray-400 mb-2">
                        <Search className="h-8 w-8 mx-auto" />
                      </div>
                      <p className="text-sm text-gray-500">No items found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      <button
                        type="button"
                        className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 mb-2"
                        onClick={handleSelectAllClick}
                        role="option"
                        aria-selected={selectedItems.length === options?.length}
                      >
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded border mr-3 transition-all",
                            selectedItems.length === options?.length
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300"
                          )}
                        >
                          {selectedItems.length === options?.length && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="font-medium">Select All</span>
                        <span className="ml-auto text-xs text-gray-400">
                          ({options.length} items)
                        </span>
                      </button>
                      
                      <div className="space-y-1">
                        {options?.map((item: any) => {
                          const selected = selectedItems.includes(item.value);
                          return (
                            <button
                              key={item.value}
                              type="button"
                              className={cn(
                                "w-full flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200",
                                selected && "bg-blue-50 border border-blue-100"
                              )}
                              onClick={(e) => handleItemClick(e, item.value)}
                              role="option"
                              aria-selected={selected}
                            >
                              <div
                                className={cn(
                                  "flex h-4 w-4 items-center justify-center rounded border mr-3 transition-all",
                                  selected
                                    ? "bg-blue-600 border-blue-600 scale-110"
                                    : "border-gray-300"
                                )}
                              >
                                {selected && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <span className={cn(
                                "transition-colors",
                                selected && "font-medium text-blue-900"
                              )}>
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {selectedItems.length > 0 && (
                        <span>{selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedItems.length > 0 && fieldIsValid && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedItems.map((value: string) => (
              <Badge
                key={value}
                variant="secondary"
                className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full"
              >
                {getItemLabel(value)}
                <button
                  type="button"
                  onClick={(e) => handleRemoveItem(e, value)}
                  className="ml-1.5 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${getItemLabel(value)}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <input
          type="hidden"
          {...register(field.name, {
            required: field.required ? "This field is required" : false,
            validate: (value: any) => {
              if (field.required && (!Array.isArray(value) || value.length === 0)) {
                return "Please select at least one item";
              }
              return true;
            }
          })}
        />
        {errors[field.name]?.message && fieldIsValid && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {String(errors[field.name]?.message)}
          </p>
        )}
        {!fieldIsValid && (
          <p className="mt-1 text-sm text-gray-500" role="alert">
            Please select a parent field first to enable this selection
          </p>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo
    return (
      prevProps.field.name === nextProps.field.name &&
      prevProps.field.label === nextProps.field.label &&
      prevProps.field.required === nextProps.field.required &&
      JSON.stringify(prevProps.field.options) === JSON.stringify(nextProps.field.options)
    );
  }
);

export default MultiSelectDropdown;