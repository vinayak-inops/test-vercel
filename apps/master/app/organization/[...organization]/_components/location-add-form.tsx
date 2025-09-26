import React, { useState } from "react";

interface LocationFormProps {
  onSubmit: (form: Record<string, string>) => void;
  onCancel: () => void;
}

export default function LocationAddForm({ onSubmit, onCancel }: LocationFormProps) {
  const [form, setForm] = useState({
    locationCode: "",
    locationName: "",
    regionCode: "",
    countryCode: "",
    stateCode: "",
    city: "",
    pincode: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full p-4">
      {[ 
        { label: "Location Code", name: "locationCode" },
        { label: "Location Name", name: "locationName" },
        { label: "Region Code", name: "regionCode" },
        { label: "Country Code", name: "countryCode" },
        { label: "State Code", name: "stateCode" },
        { label: "City", name: "city" },
        { label: "Pincode", name: "pincode" },
      ].map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <input
            type="text"
            name={field.name}
            value={form[field.name as keyof typeof form]}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
            required
          />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Add Location</button>
      </div>
    </form>
  );
} 