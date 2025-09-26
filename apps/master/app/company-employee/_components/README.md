# Employee Deployment Form Components

This directory contains the modular components for the Employee Deployment Management system. The large monolithic form has been broken down into smaller, more manageable components based on form types.

## Directory Structure

```
_components/
├── employee-deployment-form.tsx    # Main container component
├── forms/                          # Individual form components
│   ├── index.ts                    # Export barrel file
│   ├── basic-information-form.tsx  # Basic employee information
│   ├── organizational-structure-form.tsx  # Organizational hierarchy
│   ├── deployment-details-form.tsx # Employee classification & position
│   ├── management-hierarchy-form.tsx # Reporting structure
│   └── settings-remarks-form.tsx   # Settings & deployment summary
├── types/
│   └── employee-deployment.types.ts # TypeScript interfaces
└── README.md                       # This file
```

## Components Overview

### 1. Basic Information Form (`basic-information-form.tsx`)
- **Purpose**: Collects core employee details and identification information
- **Fields**: Organization details, personal details, additional information, employment details
- **Data Interface**: `BasicInformationData`

### 2. Organizational Structure Form (`organizational-structure-form.tsx`)
- **Purpose**: Defines the organizational hierarchy and structure
- **Fields**: Subsidiary, division, department, sub-department, section details
- **Data Interface**: `OrganizationalStructureData`

### 3. Deployment Details Form (`deployment-details-form.tsx`)
- **Purpose**: Manages employee category, grade, designation, and location details
- **Fields**: Employee classification, position and location, skill level
- **Data Interface**: `DeploymentDetailsData`

### 4. Management Hierarchy Form (`management-hierarchy-form.tsx`)
- **Purpose**: Defines reporting structure and management relationships
- **Fields**: Reporting manager, organizational chart preview
- **Data Interface**: `ManagementHierarchyData`

### 5. Settings & Remarks Form (`settings-remarks-form.tsx`)
- **Purpose**: Handles deployment settings and provides summary
- **Fields**: Deployment settings, remarks, deployment summary
- **Data Interface**: `SettingsRemarksData`

## TypeScript Types

All form data interfaces are defined in `types/employee-deployment.types.ts`:

- `BasicInformationData` - Basic employee information
- `OrganizationalStructureData` - Organizational structure data
- `DeploymentDetailsData` - Deployment classification data
- `ManagementHierarchyData` - Management hierarchy data
- `SettingsRemarksData` - Settings and remarks data
- `EmployeeDeploymentData` - Complete form data structure

## Usage

```tsx
import { EmployeeDeploymentForm } from "./_components/employee-deployment-form"

// Use the main component
<EmployeeDeploymentForm />
```

## Benefits of Modular Structure

1. **Maintainability**: Each form section is isolated and easier to maintain
2. **Reusability**: Individual form components can be reused in other contexts
3. **Testing**: Smaller components are easier to unit test
4. **Performance**: Better code splitting and lazy loading opportunities
5. **Type Safety**: Strong TypeScript interfaces for each form section
6. **Code Organization**: Clear separation of concerns

## Form Data Flow

The main `EmployeeDeploymentForm` component manages the overall state and coordinates data flow between the individual form components. Each form component receives:

- `formData`: The relevant portion of the complete form data
- `onFormDataChange`: Callback function to update the parent state

## Styling

All components use consistent styling with:
- Tailwind CSS classes
- Shadcn/ui components
- Gradient headers for visual distinction
- Responsive grid layouts
- Consistent spacing and typography 