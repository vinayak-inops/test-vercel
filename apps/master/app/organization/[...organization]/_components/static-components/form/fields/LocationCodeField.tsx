"use client"

import React from 'react';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { UseFormRegister } from 'react-hook-form';

interface LocationCodeFieldProps {
  register: UseFormRegister<any>;
  error?: string;
  disabled?: boolean;
}

const LocationCodeField: React.FC<LocationCodeFieldProps> = ({ register, error, disabled }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="locationCode">Location Code</Label>
      <Input
        id="locationCode"
        {...register("locationCode")}
        placeholder="Enter location code"
        className={error ? 'border-red-500' : ''}
        disabled={disabled}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default LocationCodeField; 