
import React, { useState, useRef, useEffect } from 'react';

interface VendorFilterProps {
  allVendors: string[];
  selectedVendors: string[];
  onSelectionChange: (selected: string[]) => void;
}

export default function VendorFilter({
  allVendors,
  selectedVendors,
  onSelectionChange,
}: VendorFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredVendors = allVendors.filter(vendor =>
    vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleVendor = (vendor: string) => {
    const newSelection = selectedVendors.includes(vendor)
      ? selectedVendors.filter(v => v !== vendor)
      : [...selectedVendors, vendor];
    onSelectionChange(newSelection);
  };

  return (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 rounded-lg border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-right"
      >
        {selectedVendors.length > 0
          ? `${selectedVendors.length} موردين محددين`
          : 'اختر الموردين'}
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-lg">
          <input
            type="text"
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border-b border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background"
          />
          <ul className="max-h-60 overflow-y-auto">
            {filteredVendors.map(vendor => (
              <li
                key={vendor}
                className="p-2 cursor-pointer hover:bg-light-background dark:hover:bg-dark-background flex items-center"
                onClick={() => handleToggleVendor(vendor)}
              >
                <input
                  type="checkbox"
                  checked={selectedVendors.includes(vendor)}
                  readOnly
                  className="ml-2 form-checkbox h-4 w-4 text-brand-primary border-light-border dark:border-dark-border rounded focus:ring-brand-primary"
                />
                {vendor}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
