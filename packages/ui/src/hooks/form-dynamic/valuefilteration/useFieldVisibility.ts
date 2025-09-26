import { useEffect, useCallback, useRef } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';

interface ModeField {
  field: string;
  value: 'hidden' | 'all-allow';
}

interface Messenger {
  progressbar?: string;
  mode?: ModeField[];
  organizationData?: any;
}

interface UseFieldVisibilityProps {
  messenger: Messenger;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  organizationData: any;
  fieldUpdateControl: (field: string) => { startingValue: Record<string, any[]> };
  onFieldUpdate?: (fieldName: string, value: any) => void;
}

type FieldName = 'subsidiaries' | 'divisions' | 'departments' | 'subDepartments' | 'sections' | 'designations' | 'location' | 'grades';

const childFieldMap: Record<FieldName, FieldName[]> = {
  subsidiaries: ["divisions", "departments", "subDepartments", "sections", "designations", "grades", "location"],
  divisions: ["departments", "subDepartments", "sections", "designations", "grades"],
  departments: ["subDepartments", "sections"],
  subDepartments: ["sections"],
  designations: ["grades"],
  sections: [],
  location: [],
  grades: []
};

const parentFieldMap: Record<FieldName, FieldName | null> = {
  subsidiaries: null,
  divisions: "subsidiaries",
  departments: "divisions",
  subDepartments: "departments",
  sections: "subDepartments",
  designations: "divisions",
  location: null,
  grades: "designations"
};

export const useFieldVisibility = ({
  messenger,
  setValue,
  watch,
  organizationData,
  fieldUpdateControl,
  onFieldUpdate
}: UseFieldVisibilityProps) => {
  // Keep track of previous mode values
  const prevModeRef = useRef<ModeField[]>([]);

  // Function to get parent field
  const getParentField = useCallback((fieldName: FieldName): FieldName | null => {
    return parentFieldMap[fieldName] || null;
  }, []);

  // Function to reset child fields when parent field changes
  const resetChildFields = useCallback((parentField: FieldName) => {
    const immediateChildren = childFieldMap[parentField] || [];
    
    console.log(`Resetting children for parent ${parentField}:`, immediateChildren);
    
    immediateChildren.forEach(childField => {
      // Check if the child field is hidden
      const isChildHidden = messenger?.mode?.some(
        (item: any) => item.field === childField && item.value === 'hidden'
      );

      console.log(`Child field ${childField} is hidden:`, isChildHidden);

      if (isChildHidden) {
        // If child is hidden, update its children (grandchildren of parent)
        const grandChildren = childFieldMap[childField] || [];
        console.log(`Updating grandchildren of ${childField}:`, grandChildren);
        
        grandChildren.forEach(grandChild => {
          const parentValue = watch(parentField) || [];
          const initialData = fieldUpdateControl("subsidiaries")?.startingValue || {};
          const grandChildData = initialData[grandChild] || [];
          
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
          onFieldUpdate?.(grandChild, filteredGrandChildData);
        });
      } else {
        // If child is not hidden, reset it normally
        console.log(`Resetting visible child field ${childField}`);
        setValue(childField, [], {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
        onFieldUpdate?.(childField, []);
      }
    });
  }, [setValue, onFieldUpdate, messenger?.mode, watch, fieldUpdateControl]);

  // Function to update field value and trigger necessary updates
  const updateFieldValue = useCallback((fieldName: FieldName, value: any[]) => {
    setValue(fieldName, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    onFieldUpdate?.(fieldName, value);
    resetChildFields(fieldName);
  }, [setValue, onFieldUpdate, resetChildFields]);

  // Function to handle field updates
  const handleField = useCallback((fieldName: FieldName) => {
    if (!messenger?.mode || !organizationData) return;

    const hiddenFields = new Map(
      messenger.mode
        .filter(field => field.value === 'hidden')
        .map(field => [field.field, true])
    );

    if (hiddenFields.has(fieldName)) {
      // If the field itself is hidden, update its children instead
      const children = childFieldMap[fieldName] || [];
      children.forEach(childField => {
        const parentField = getParentField(childField);
        if (parentField) {
          const parentValue = watch(parentField) || [];
          const initialData = fieldUpdateControl("subsidiaries")?.startingValue || {};
          const childData = initialData[childField] || [];
          
          // Filter child data based on grandparent selection
          const filteredChildData = childData.filter((item: any) => {
            if (!item) return false;
            
            switch (childField) {
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

          setValue(childField, filteredChildData, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
          });
          onFieldUpdate?.(childField, filteredChildData);
        }
      });
      return;
    }

    const parentField = getParentField(fieldName);
    const initialData = fieldUpdateControl("subsidiaries")?.startingValue || {};

    if (!parentField) {
      // Independent field (like location)
      const fieldData = initialData[fieldName] || [];
      updateFieldValue(fieldName, fieldData);
      return;
    }

    // Dependent field - filter based on parent selection
    const parentValue = watch(parentField) || [];
    const fieldData = initialData[fieldName] || [];
    
    const filteredData = fieldData.filter((item: any) => {
      switch (fieldName) {
        case "divisions":
          return parentValue.some((sub: any) => sub.value === item.subsidiaryCode);
        case "departments":
          return parentValue.some((div: any) => div.value === item.divisionCode);
        case "subDepartments":
          return parentValue.some((dept: any) => dept.value === item.departmentCode);
        case "sections":
          return parentValue.some((subDept: any) => subDept.value === item.subDepartmentCode);
        case "designations":
          return parentValue.some((div: any) => div.value === item.divisionCode);
        case "grades":
          return parentValue.some((des: any) => des.value === item.designationCode);
        case "location":
          return parentValue.some((sub: any) => sub.value === item.locationCode);
        default:
          return false;
      }
    });

    updateFieldValue(fieldName, filteredData);
  }, [messenger?.mode, organizationData, watch, fieldUpdateControl, updateFieldValue, getParentField, childFieldMap, setValue, onFieldUpdate]);

  // Function to check if mode has changed
  const hasModeChanged = useCallback((currentMode: ModeField[] = []) => {
    if (prevModeRef.current.length !== currentMode.length) return true;
    
    return currentMode.some((field, index) => {
      const prevField = prevModeRef.current[index];
      return !prevField || 
             field.field !== prevField.field || 
             field.value !== prevField.value;
    });
  }, []);

  // Function to update fields based on mode changes
  const updateFieldsOnModeChange = useCallback(() => {
    if (!messenger?.mode || !organizationData) return;

    // Check if mode has actually changed
    if (!hasModeChanged(messenger.mode)) return;

    // Update previous mode reference
    prevModeRef.current = [...messenger.mode];

    // Process all fields
    Object.keys(childFieldMap).forEach(field => {
      handleField(field as FieldName);
    });
  }, [messenger?.mode, organizationData, handleField, hasModeChanged]);

  // Effect to watch for field changes
  useEffect(() => {
    const fields = Object.keys(childFieldMap) as FieldName[];
    const unsubscribes: Array<() => void> = [];
    
    fields.forEach(field => {
      const unsubscribe = watch((value, { name }) => {
        if (name === field) {
          const parentField = getParentField(field as FieldName);
          if (parentField) {
            handleField(field as FieldName);
          }
        }
      });

      if (typeof unsubscribe === 'function') {
        unsubscribes.push(unsubscribe);
      }
    });

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [watch, handleField, getParentField]);

  // Return the update function
  return {
    updateFieldsOnModeChange
  };
}; 