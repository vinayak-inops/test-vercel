import React from 'react';
import { Button } from '@repo/ui/components/ui/button';

interface FormActionsProps {
  onSave?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ onSave, onCancel, loading = false }) => {
  return (
    <div className="flex gap-3 justify-end mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={onSave}
        disabled={loading}
        style={{ backgroundColor: '#2d81ff' }}
        className="hover:opacity-90"
      >
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
};

export default FormActions; 