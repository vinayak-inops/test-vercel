# Form Validation Setup

This document describes the validation setup for the Employee Deployment forms using Yup, React Hook Form, and TypeScript.

## Dependencies

The following packages are required for form validation:

```json
{
  "@hookform/resolvers": "^3.9.0",
  "react-hook-form": "^7.53.2",
  "yup": "^1.6.1"
}
```

## Validation Schema

### Basic Information Form Validation

The `BasicInformationForm` uses Yup schema validation with the following rules:

```typescript
const basicInformationSchema = yup.object().shape({
  employeeCode: yup
    .string()
    .required("Employee code is required")
    .min(2, "Employee code must be at least 2 characters"),
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  middleName: yup
    .string()
    .optional(),
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  gender: yup
    .string()
    .required("Gender is required")
    .oneOf(["male", "female", "other"], "Please select a valid gender"),
  birthDate: yup
    .string()
    .required("Birth date is required"),
  bloodGroup: yup
    .string()
    .required("Blood group is required")
    .oneOf(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], "Please select a valid blood group"),
  nationality: yup
    .string()
    .required("Nationality is required")
    .min(2, "Nationality must be at least 2 characters"),
  maritalStatus: yup
    .string()
    .required("Marital status is required")
    .oneOf(["Unmarried", "Married", "Divorced", "Widowed"], "Please select a valid marital status"),
  joiningDate: yup
    .string()
    .required("Joining date is required"),
  emailID: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
})
```

## Validation Rules

### Required Fields
- **Employee Code**: Must be at least 2 characters
- **First Name**: Must be at least 2 characters
- **Last Name**: Must be at least 2 characters
- **Gender**: Must be one of: male, female, other
- **Birth Date**: Must be selected
- **Blood Group**: Must be one of the valid blood groups
- **Nationality**: Must be at least 2 characters
- **Marital Status**: Must be one of: Unmarried, Married, Divorced, Widowed
- **Joining Date**: Must be selected
- **Email ID**: Must be a valid email address

### Optional Fields
- **Middle Name**: Optional field

## Error Display

Validation errors are displayed inline below each field with:
- Red text color (`text-red-500`)
- Small font size (`text-xs`)
- Clear error messages

## Form Integration

The form uses React Hook Form with Yup resolver:

```typescript
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  reset,
  setValue,
  watch,
} = useForm<BasicInformationFormData>({
  resolver: yupResolver(basicInformationSchema),
  defaultValues: formData,
})
```

## Real-time Validation

The form provides real-time validation feedback:
- Errors appear as users type
- Form data is validated on every change
- Parent component is updated with validated data

## Type Safety

All form data is fully typed with TypeScript:
- Form data interfaces match Yup schemas
- String types for enum fields (validated by Yup)
- Type inference provides excellent IDE support

## Field Styling

The form matches the LocationFormModal design with:
- Consistent field heights (`h-12`)
- Proper padding and margins
- Focus states with blue borders
- Rounded corners (`rounded-xl`)
- Grid layout for responsive design

## Usage Example

```typescript
<BasicInformationForm
  formData={basicInformationData}
  onFormDataChange={updateBasicInformation}
/>
```

The form automatically handles validation and provides error feedback to users with the exact styling and layout matching the LocationFormModal design. 