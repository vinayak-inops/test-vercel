import TopTitleDescription from '@repo/ui/components/titleline/top-title-discription';
import { cn } from '@repo/ui/lib/utils';
import Link from 'next/link';
import React, { useState } from 'react';
import { FaSearch, FaTimes } from "react-icons/fa";

interface LocalPopupNavbarProps {
  navigation: any;
  pathname?: any;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

function LocalPopupNavbar({ navigation, pathname, selected, setSelected }: LocalPopupNavbarProps) {
  const [search, setSearch] = useState("");

  // Filtered nav data based on search
  const filteredNavigation = navigation.map((group: any) => ({
    ...group,
    items: group.items.filter((item: any) =>
      item.title.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  // Handle checkbox toggle
  const handleToggle = (title: string) => {
    setSelected(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <nav className="flex-1 overflow-y-auto font-sans">
      <div className='px-2 mb-2'>
        <TopTitleDescription
          titleValue={{
            title: "Select report",
            description: "You want to download a report related to your selected topic easily.",
          }}
        />
      </div>
      {/* Search Field with Icon */}
      <div className="px-2 mb-0 mt-1 relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <FaSearch className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search reports..."
          className="w-full pl-10 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white shadow-sm"
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setSearch("")}
            tabIndex={-1}
            type="button"
            aria-label="Clear search"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>

      {filteredNavigation.map((group: any, i: number) => (
        <div key={i} className="px-2 py-2">
          <ul>
            {group.items.map((item: any, j: number) => {
              const isActive = pathname === item.href;
              const isChecked = selected.includes(item.title);
              return (
                <li key={j} className="mb-0">
                  <label
                    className={cn(
                      "flex  items-center gap-3 px-2 py-1.5 rounded-lg font-medium text-sm transition-all duration-150 font-sans tracking-wide ws-custom cursor-pointer",
                      isActive
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm"
                        : "hover:bg-blue-100 hover:text-blue-700 text-[#4b5563]"
                    )}
                  >
                    <div className='h-4 w-4'>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(item.title)}
                        className="form-checkbox h-3.5 w-3.5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                    <span className="truncate text-sm">{item.title}</span>
                    {item.badge && (
                      <span className={cn(
                        "ml-auto text-xs px-2 py-0.5 rounded",
                        item.badge === "NEW"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-gray-100 text-gray-200"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
          {/* Divider between groups, except last */}
          {i < navigation.length - 1 && (
            <div className="my-3 border-b border-gray-200" />
          )}
        </div>
      ))}
    </nav>
  );
}

export default LocalPopupNavbar;