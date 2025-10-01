import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from '../Icons';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  count: number;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  count,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <button
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-gray-700"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>
          {title} ({count})
        </span>
        {isOpen ? (
          <ChevronUp className="w-6 h-6" />
        ) : (
          <ChevronDown className="w-6 h-6" />
        )}
      </button>
      {isOpen && <div className="border-t border-gray-200">{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
