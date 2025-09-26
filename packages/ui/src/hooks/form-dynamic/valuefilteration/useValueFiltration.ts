import { useCallback, useEffect, useRef, useMemo } from 'react';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';

interface UseValueFiltrationProps {
  fieldUpdateControl: (field: string) => { startingValue: Record<string, any[]> };
  watch: UseFormWatch<any>;
  filteredDataCall: any;
  setValue: UseFormSetValue<any>;
  messenger: any;
}

type FieldName = 'subsidiaries' | 'divisions' | 'departments' | 'subDepartments' | 'sections' | 'designations' | 'location' | 'grades';

const initialFieldValues: Record<FieldName, any[]> = {
  subsidiaries: [],
  divisions: [],
  departments: [],
  subDepartments: [],
  sections: [],
  designations: [],
  location: [],
  grades: []
};

interface CachedFilterValue {
  selectedValues: any[];
  filteredData: Record<string, any[]>;
}

function hiddenValueUpdater(
  fieldName: FieldName,
  messenger: any,
  parentFieldMap: Record<FieldName, string>,
  watch: any,
  setValue?: any
) {
  const parentField = parentFieldMap[fieldName] || fieldName;

  // Check if the parentField is hidden in messenger.mode
  const isParentHidden = messenger?.mode?.some(
    (item: any) => item.field === parentField && item.value === "hidden"
  );

  if (isParentHidden || watch(parentField)) {
    if (parentField === "subsidiaries") {
      return {Key:"All",field:parentField};
    } else {
      // Check if the grandparent is hidden
      const grandParent = parentFieldMap[parentField as FieldName];
      const isGrandParentHidden = messenger?.mode?.some(
        (item: any) => item.field === grandParent && item.value === "hidden"
      );
      if (isGrandParentHidden || watch(grandParent)) {
        return hiddenValueUpdater(parentField as FieldName, messenger, parentFieldMap, watch, setValue);
      } else {
        let filterKey: any;
        if (grandParent == "subsidiaries") {
          filterKey = "subsidiaryCode";
        } else if (grandParent == "divisions") {
          filterKey = "divisionCode";
        } else if (grandParent == "departments") {
          filterKey = "departmentCode";
        } else if (grandParent == "subDepartments") {
          filterKey = "subDepartmentCode";
        } else if (grandParent == "sections") {
          filterKey = "sectionCode";
        } else if (grandParent == "designations") {
          filterKey = "designationCode";
        } else if (grandParent == "grades") {
          filterKey = "gradeCode";
        } else if (grandParent == "location") {
          filterKey = "locationCode";
        }
        return {Key:filterKey,field:grandParent};
      }
    }
  } else {
    let filterKey: any;
    if (parentField == "subsidiaries") {
      filterKey = "subsidiaryCode";
    } else if (parentField == "divisions") {
      filterKey = "divisionCode";
    } else if (parentField == "departments") {
      filterKey = "departmentCode";
    } else if (parentField == "subDepartments") {
      filterKey = "subDepartmentCode";
    } else if (parentField == "sections") {
      filterKey = "sectionCode";
    } else if (parentField == "designations") {
      filterKey = "designationCode";
    } else if (parentField == "grades") {
      filterKey = "gradeCode";
    } else if (parentField == "location") {
      filterKey = "locationCode";
    }
    return {Key:filterKey,field:parentField};
  }
}

export const useValueFiltration = ({
  fieldUpdateControl,
  watch,
  filteredDataCall,
  setValue,
  messenger
}: UseValueFiltrationProps) => {
  // Memoize static data
  const parentFieldMap = useMemo<Record<FieldName, string>>(() => ({
    subsidiaries: "",
    divisions: "subsidiaries",
    departments: "divisions",
    subDepartments: "departments",
    sections: "subDepartments",
    designations: "divisions",
    location: "",
    grades: "designations"
  }), []);

  const childFieldMap = useMemo<Record<FieldName, FieldName[]>>(() => ({
    subsidiaries: ["divisions", "departments", "subDepartments", "sections", "designations", "grades"],
    divisions: ["departments", "subDepartments", "sections", "designations", "grades"],
    departments: ["subDepartments", "sections"],
    subDepartments: ["sections"],
    designations: ["grades"],
    sections: [],
    location: [],
    grades: []
  }), []);

  // Use refs for values that shouldn't trigger re-renders
  const previousValues = useRef<Record<FieldName, any[]>>(initialFieldValues);
  const isInitialMount = useRef(true);
  const watchedFields = useRef<Set<FieldName>>(new Set());
  const orgDataRef = useRef<Record<string, any[]>>({});


  // Add initialRender flag
  const initialRender = useRef(true);
  const lastFilteredValues = useRef<Record<string, CachedFilterValue>>({});

  // Log all watched field names and their current values
  // try {
  //   const allWatchedValues = watch && typeof watch === 'function' ? watch() : {};
  //   console.log('All watched fields and values:', allWatchedValues);
  // } catch (e) {
  //   console.warn('Unable to log watched fields:', e);
  // }

  // Memoize the reset function
  const resetChildFields = useCallback((parentField: FieldName, newValue: any[] = []) => {
    if (!parentField) return;

    const immediateChildren = childFieldMap[parentField] || [];
    const oldValue = previousValues.current[parentField] || [];

    // Skip initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousValues.current[parentField] = [...newValue];
      return;
    }

    // Use deep comparison for arrays
    const hasChanged = !oldValue ||
      oldValue.length !== (newValue?.length || 0) ||
      !oldValue.every((val, index) => val === newValue?.[index]);

    if (hasChanged) {
      console.log(`Parent field ${parentField} changed, processing immediate children:`, immediateChildren);
      
      // Process immediate children
      immediateChildren.forEach((childField: FieldName) => {
        if (!childField) return;

        // Check if the child field is hidden
        const isChildHidden = messenger?.mode?.some(
          (item: any) => item.field === childField && item.value === "hidden"
        );

        console.log(`Child field ${childField} is hidden:`, isChildHidden);

        if (isChildHidden) {
          // If child is hidden, update its children (grandchildren of parent)
          const grandChildren = childFieldMap[childField] || [];
          console.log(`Updating grandchildren of ${childField}:`, grandChildren);
          
          grandChildren.forEach((grandChild: FieldName) => {
            if (!grandChild) return;
            
            // Get the appropriate filter key for the grandchild
            const grandChildParent = parentFieldMap[grandChild];
            let filterKey: string;
            
            switch (grandChildParent) {
              case "divisions":
                filterKey = "divisionCode";
                break;
              case "departments":
                filterKey = "departmentCode";
                break;
              case "subDepartments":
                filterKey = "subDepartmentCode";
                break;
              case "designations":
                filterKey = "designationCode";
                break;
              default:
                filterKey = "";
            }

            if (filterKey && orgDataRef.current[grandChild]) {
              const grandChildData = orgDataRef.current[grandChild] || [];
              const parentValue = watch(parentField) || [];
              
              // Filter grandchild data based on parent selection
              const filteredGrandChildData = grandChildData.filter((item: any) => {
                if (!item) return false;
                
                switch (grandChild) {
                  case "departments":
                    return parentValue.some((div: any) => div.value === item.divisionCode);
                  case "subDepartments":
                    return parentValue.some((dept: any) => dept.value === item.departmentCode);
                  case "sections":
                    return parentValue.some((subDept: any) => subDept.value === item.subDepartmentCode);
                  case "grades":
                    return parentValue.some((des: any) => des.value === item.designationCode);
                  default:
                    return false;
                }
              });

              console.log(`Setting grandchild ${grandChild} with ${filteredGrandChildData.length} items`);
              setValue(grandChild, filteredGrandChildData, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
              previousValues.current[grandChild] = [...filteredGrandChildData];
            }
          });
        } else {
          // If child is not hidden, reset it normally
          console.log(`Resetting visible child field ${childField}`);
          setValue(childField, [], {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
          });
          previousValues.current[childField] = [];
        }
      });

      previousValues.current[parentField] = [...(newValue || [])];
    }
  }, [childFieldMap, setValue, messenger?.mode, watch, parentFieldMap]);

  // Memoize the filter function
  const filterParentValue = useCallback((fieldName: FieldName) => {
    if (!fieldName) return {};

    // Special case: location is independent, always return all options
    if (fieldName === "location") {
      if (!orgDataRef.current.subsidiaries) {
        orgDataRef.current = fieldUpdateControl("subsidiaries")?.startingValue || {};
      }
      const filteredData: Record<string, any[]> = { ...filteredDataCall };
      filteredData.location = Array.isArray(orgDataRef.current.location)
        ? orgDataRef.current.location
        : [];
      // Cache the result
      lastFilteredValues.current[fieldName] = {
        selectedValues: [],
        filteredData
      };
      initialRender.current = false;
      return filteredData;
    }

    const parentField = parentFieldMap[fieldName] || fieldName;
    hiddenValueUpdater(fieldName, messenger, parentFieldMap, watch, setValue);
    const key:any = hiddenValueUpdater(fieldName, messenger, parentFieldMap, watch, setValue);
    const filterKey = key?.Key;
    const selectedValues = watch(key?.field) || [];

    // Return cached value if not initial render and values haven't changed
    if (!initialRender.current &&
      lastFilteredValues.current[fieldName] &&
      JSON.stringify(selectedValues) === JSON.stringify(lastFilteredValues.current[fieldName].selectedValues)) {
      return lastFilteredValues.current[fieldName].filteredData;
    }

    if(filterKey == "All"){
      console.log(fieldName,"All");
    }

    // Update org data ref only when needed
    if (!orgDataRef.current.subsidiaries) {
      orgDataRef.current = fieldUpdateControl("subsidiaries")?.startingValue || {};
    }

    const filteredData: Record<string, any[]> = { ...filteredDataCall };

    if (fieldName === "subsidiaries") {
      filteredData.subsidiaries = Array.isArray(orgDataRef.current.subsidiaries)
        ? orgDataRef.current.subsidiaries
        : [];

      // Cache the result
      lastFilteredValues.current[fieldName] = {
        selectedValues: [...selectedValues],
        filteredData
      };

      initialRender.current = false;
      return filteredData;
    }

    const currentFieldData = Array.isArray(orgDataRef.current[fieldName])
      ? orgDataRef.current[fieldName]
      : [];

    if (filterKey != "All") {
      const filteredItems = currentFieldData.filter((item: any) => {
        if (!item) return false;
        // Direct switch statement for filtering
        switch (fieldName) {
          case "divisions":
            return selectedValues.includes(item[filterKey]);
          case "departments":
            return selectedValues.includes(item[filterKey]);
          case "subDepartments":
            return selectedValues.includes(item[filterKey]);
          case "sections":
            return selectedValues.includes(item[filterKey]);
          case "designations":
            return selectedValues.includes(item[filterKey]);
          case "grades":
            return selectedValues.includes(item[filterKey]);
          default:
            return false;
        }
      });
      filteredData[fieldName] = filteredItems;
    } else {
      filteredData[fieldName] = currentFieldData;
    }

    // Cache the result
    lastFilteredValues.current[fieldName] = {
      selectedValues: [...selectedValues],
      filteredData
    };

    initialRender.current = false;
    return filteredData;
  }, [filteredDataCall, parentFieldMap, watch]);

  // Set up watchers with improved tracking
  useEffect(() => {
    if (!watch || typeof watch !== 'function') return;

    const fields = Object.keys(parentFieldMap || {}) as FieldName[];
    const cleanupFns: Array<() => void> = [];

    fields.forEach(field => {
      if (!field || watchedFields.current.has(field)) return;

      try {
        watchedFields.current.add(field);
        const currentValue = watch(field) || [];
        previousValues.current[field] = Array.isArray(currentValue) ? [...currentValue] : [];

        let timeoutId: NodeJS.Timeout;
        const stopWatching = watch((formValues: Record<string, any> = {}, { name }: { name?: string } = {}) => {
          if (name === field && formValues) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              const newValue = Array.isArray(formValues[field]) ? formValues[field] : [];
              
              // Always reset child fields when parent changes
              resetChildFields(field, newValue);
            }, 100);
          }
        });

        if (typeof stopWatching === 'function') {
          cleanupFns.push(() => {
            clearTimeout(timeoutId);
          });
        }
      } catch (error) {
        console.error(`Error setting up watcher for field ${field}:`, error);
      }
    });

    return () => cleanupFns.forEach(cleanup => cleanup());
  }, [watch, resetChildFields]);

  // Add cleanup effect to reset initialRender when component unmounts
  useEffect(() => {
    return () => {
      initialRender.current = true;
      lastFilteredValues.current = {};
    };
  }, []);

  return {
    filterParentValue
  };
}; 