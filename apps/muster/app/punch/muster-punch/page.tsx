"use client";
import { useState, useEffect } from "react";
import MusterSearchPopup from "./_components/muster-search-popup";
import Component from "./_components/sample-emplist";

export default function Page() {
  const [showPopup, setShowPopup] = useState(true);
  const [showComponent, setShowComponent] = useState(false);

  useEffect(() => {
    // Show popup when page loads
    setShowPopup(true);
    setShowComponent(false);
  }, []);

  const handlePopupClose = () => {
    setShowPopup(false);
    setShowComponent(true);
  };

  return (
    <>
      {showPopup && (
        <MusterSearchPopup 
          isOpen={showPopup} 
          onClose={handlePopupClose} 
        />
      )}
      
    </>
  );
}
