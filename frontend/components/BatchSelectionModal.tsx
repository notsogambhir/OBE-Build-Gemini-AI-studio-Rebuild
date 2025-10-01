import React, { useMemo, useState, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Program } from '../types';
import { getProgramDuration } from '../utils/helpers';

interface BatchSelectionModalProps {
  program: Program;
  onClose: () => void;
}

const BatchSelectionModal: React.FC<BatchSelectionModalProps> = ({
  program,
  onClose,
}) => {
  const { setProgramAndBatch } = useAppContext();
  const duration = getProgramDuration(program.name);

  const batchYears = useMemo(() => {
    const startYears = Array.from({ length: 8 }, (_, i) => 2025 - i); // 2025 down to 2018
    return startYears.map((startYear) => `${startYear}-${startYear + duration}`);
  }, [duration]);

  const [batch, setBatch] = useState(batchYears[0]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setProgramAndBatch(program, batch);
    onClose();
  }, [program, batch, setProgramAndBatch, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2">Select Batch</h2>
        <p className="mb-6 text-gray-600">
          For Program: <span className="font-semibold">{program.name}</span>
        </p>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="batch-select"
            className="block text-sm font-medium text-gray-700"
          >
            Batch Year
          </label>
          <select
            id="batch-select"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
          >
            {batchYears.map((yearString) => (
              <option key={yearString} value={yearString}>
                {yearString}
              </option>
            ))}
          </select>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Proceed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchSelectionModal;
