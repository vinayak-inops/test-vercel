import { useState, useCallback, useEffect } from "react";
import { OTPolicyApplication } from "../../app/policy/over-time/_components/types";

export type OTPolicyItem = OTPolicyApplication;
  

interface OTCrudHook {
  otPolicies: OTPolicyItem[];
  otPolicy: OTPolicyItem | null;
  addOTPolicy: (policy: OTPolicyItem) => void;
  updateOTPolicy: (id: string, updatedPolicy: OTPolicyItem) => void;
  deleteOTPolicy: (id: string) => void;
  getOTPolicyById: (id: string) => OTPolicyItem | undefined;
  setOTPolicy: (policy: OTPolicyItem | null) => void;
  resetOTPolicy: () => void;
}

export function useOTCrud(initialPolicies: OTPolicyItem[] = []): OTCrudHook {
  const [otPolicies, setOTPolicies] = useState<OTPolicyItem[]>(initialPolicies);
  const [otPolicy, setOTPolicyState] = useState<OTPolicyItem | null>(null);

  // Update policies when initialPolicies changes
  useEffect(() => {
    console.log("OT Hook initializing with policies:", initialPolicies);
    if (initialPolicies && Array.isArray(initialPolicies)) {
      setOTPolicies(initialPolicies);
    }
  }, [initialPolicies]);

  // Generate unique ID helper
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  const addOTPolicy = useCallback(
    (policy: OTPolicyItem) => {
      console.log("addOTPolicy called with:", policy);
      
      const newPolicy = {
        ...policy,
        _id: policy._id || generateId(),
      };
      
      setOTPolicies((prev) => {
        const updated = [...prev, newPolicy];
        console.log("addOTPolicy - Updated policies:", updated);
        return updated;
      });
    },
    [generateId]
  );

  const updateOTPolicy = useCallback(
    (id: string, updatedPolicy: OTPolicyItem) => {
      console.log("🔧 OT HOOK UPDATE METHOD CALLED!");
      console.log("ID to Update:", id);
      console.log("Updated Policy Data:", updatedPolicy);
      console.log("Current Policies Count:", otPolicies.length);
      
      setOTPolicies((prev) => {
        console.log("Current policies before update:", prev);
        
        const updatedPolicies = prev.map((item) => {
          if (item._id === id) {
            console.log("✅ Found item to update:", item);
            const updated = { ...item, ...updatedPolicy, _id: id };
            console.log("✅ Updated item:", updated);
            return updated;
          }
          return item;
        });
        
        console.log("✅ All policies after update:", updatedPolicies);
        return updatedPolicies;
      });
      
      // Update current policy state if it matches
      setOTPolicyState((prev) => {
        if (prev && prev._id === id) {
          return { ...prev, ...updatedPolicy, _id: id };
        }
        return prev;
      });
    },
    [otPolicies.length]
  );

  const deleteOTPolicy = useCallback(
    (id: string) => {
      console.log("deleteOTPolicy called with id:", id);
      
      setOTPolicies((prev) => {
        console.log("Current policies before delete:", prev);
        const filtered = prev.filter((item) => item._id !== id);
        console.log("Policies after delete:", filtered);
        return filtered;
      });
      
      setOTPolicyState((prev) => {
        if (prev && prev._id === id) {
          return null;
        }
        return prev;
      });
    },
    []
  );

  const getOTPolicyById = useCallback(
    (id: string) => {
      const found = otPolicies.find((item) => item._id === id);
      console.log("getOTPolicyById - Found:", found);
      return found;
    },
    [otPolicies]
  );

  const setOTPolicy = useCallback((policy: OTPolicyItem | null) => {
    console.log("setOTPolicy called with:", policy);
    setOTPolicyState(policy);
  }, []);

  const resetOTPolicy = useCallback(() => {
    console.log("resetOTPolicy called");
    setOTPolicyState(null);
  }, []);

  return {
    otPolicies,
    otPolicy,
    addOTPolicy,
    updateOTPolicy,
    deleteOTPolicy,
    getOTPolicyById,
    setOTPolicy,
    resetOTPolicy,
  };
}