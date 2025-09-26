import React, { useEffect, useRef, useState } from "react";
import { Check, Search } from "lucide-react";

const options = [
  "Full Name",
  "Email",
  "Company Domain",
  "LinkedIn Profile",
  "Profile Bio",
  "Announcement",
  "Additional instructions",
];

const DropdownSelect = ({ selected, setSelected, parentRef }: any) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<"down" | "up">("down");
  const buttonRef = useRef<HTMLDivElement | null>(null);

  const handleOpenDropdown = () => {
    if (buttonRef.current && parentRef.current) {
      const parentHeight = parentRef.current.offsetHeight;
      const dropdownTop = buttonRef.current.offsetTop;
      const spaceBelow = parentHeight - dropdownTop - buttonRef.current.offsetHeight;
      const spaceAbove = dropdownTop;

      setPosition(spaceBelow < 150 && spaceAbove > spaceBelow ? "up" : "down");
      setDropdownOpen(!dropdownOpen);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={buttonRef}>
      <div
        onClick={handleOpenDropdown}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 cursor-pointer bg-white text-gray-700 hover:border-gray-400 transition shadow-sm"
      >
        {selected || "Select column"}
      </div>

      {dropdownOpen && (
        <div
          className={`absolute z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-64 -ml-14 max-h-60 overflow-y-auto transition-all duration-300 ease-in-out ${
            position === "down" ? "top-full mt-2" : "bottom-full mb-2"
          }`}
        >
          <div className="flex items-center px-3 py-2 border-b">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm text-gray-700 outline-none"
            />
          </div>

          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt}
                className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-700 transition ${
                  selected === opt ? "bg-blue-100 font-medium" : ""
                }`}
                onClick={() => {
                  setSelected(opt);
                  setDropdownOpen(false);
                  setSearch("");
                }}
              >
                <span>{opt}</span>
                {selected === opt && <Check className="w-4 h-4 text-blue-600" />}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-400 text-sm">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

const LeadMappingUI = () => {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [prospectInfo, setProspectInfo] = useState("");
  const [trigger, setTrigger] = useState("");
  const [instructions, setInstructions] = useState("");

  return (
    <div className="max-w-lg mx-auto pt-0 space-y-4" ref={parentRef}>
      

      <div className="space-y-4">
        <div className="text-sm text-gray-500 mt-4">Property in Twain</div>

        {[
          { label: "Name", component: <input type="text" value="Name" disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700" /> },
          { label: "Prospect Info", component: <DropdownSelect selected={prospectInfo} setSelected={setProspectInfo} parentRef={parentRef} /> },
          { label: "Trigger", component: <DropdownSelect selected={trigger} setSelected={setTrigger} parentRef={parentRef} /> },
          { label: "Instructions", component: <DropdownSelect selected={instructions} setSelected={setInstructions} parentRef={parentRef} /> },
        ].map(({ label, component }, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="w-1/2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md p-2.5">
              {label}
            </div>
            <div className="w-1/2">{component}</div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
        Continue
      </button>
    </div>
  );
};

export default LeadMappingUI;
