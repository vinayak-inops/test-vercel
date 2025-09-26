import React from 'react';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { UseFormRegister } from 'react-hook-form';

interface LocationNameFieldProps {
  register: UseFormRegister<any>;
  error?: string;
}

const LocationNameField: React.FC<LocationNameFieldProps> = ({ register, error }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="locationName">Location Name</Label>
      <Input
        id="locationName"
        {...register("locationName")}
        placeholder="Enter location name"
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default LocationNameField; 