import React from 'react';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Textarea } from '@repo/ui/components/ui/textarea';

interface AddressFieldsProps {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  onAddressChange?: (value: string) => void;
  onCityChange?: (value: string) => void;
  onStateChange?: (value: string) => void;
  onCountryChange?: (value: string) => void;
  onZipCodeChange?: (value: string) => void;
}

const AddressFields: React.FC<AddressFieldsProps> = ({
  address,
  city,
  state,
  country,
  zipCode,
  onAddressChange,
  onCityChange,
  onStateChange,
  onCountryChange,
  onZipCodeChange
}) => {
  return (
    <div className="space-y-4">
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={city || ''}
            onChange={(e) => onCityChange?.(e.target.value)}
            placeholder="Enter city"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={state || ''}
            onChange={(e) => onStateChange?.(e.target.value)}
            placeholder="Enter state"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={country || ''}
            onChange={(e) => onCountryChange?.(e.target.value)}
            placeholder="Enter country"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={zipCode || ''}
            onChange={(e) => onZipCodeChange?.(e.target.value)}
            placeholder="Enter ZIP code"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressFields; 