'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SheetTabsProps {
  functionalityList: { sheettabs: boolean };
  excelData: { data: { [key: string]: any } };
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export default function SheetTabs({
  functionalityList,
  excelData,
  activeTab,
  setActiveTab,
}: SheetTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    const container = scrollRef.current;
    if (container) {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < maxScrollLeft - 1);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      const newScrollLeft =
        direction === 'left'
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      setTimeout(checkScrollButtons, 300);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    checkScrollButtons();
    const handleScroll = () => checkScrollButtons();
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScrollButtons);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, []);

  if (!functionalityList.sheettabs) {
    return null;
  }

  const sheetNames = Object.keys(excelData.data);

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="p-2 rounded-full bg-white hover:bg-gray-200 transition hidden sm:inline-flex"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
      )}

      {/* Scrollable Tabs */}
      <div
        ref={scrollRef}
        className="overflow-x-auto max-w-[70%] flex gap-2 px-2 scroll-smooth hide-scrollbar relative"
      >
        <div className="flex gap-2">
          {sheetNames.map((sheetName) => (
            <button
              key={sheetName}
              onClick={() => setActiveTab(sheetName)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === sheetName
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-purple-100 hover:text-purple-700'
              }`}
            >
              {sheetName}
            </button>
          ))}
        </div>
      </div>

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="p-2 rounded-full bg-white hover:bg-gray-200 transition hidden sm:inline-flex"
        >
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      )}
    </div>
  );
}
