import React, { useMemo, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Program } from '../types';

interface BatchSelectionModalProps {
  program: Program;
  onClose: () => void;
}

const BatchSelectionModal: React.FC<BatchSelectionModalProps> = ({ program, onClose }) => {
    const { data, setProgramAndBatch } = useAppContext();
    
    const availableBatches = useMemo(() => {
        return data.batches
            .filter(b => b.programId === program.id)
            .sort((a,b) => b.name.localeCompare(a.name));
    }, [data.batches, program.id]);

    const [batch, setBatch] = useState(availableBatches.length > 0 ? availableBatches[0].name : "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!batch) {
            alert("Please select a batch.");
            return;
        }
        setProgramAndBatch(program, batch);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-2">Select Batch</h2>
                <p className="mb-6 text-gray-600">For Program: <span className="font-semibold">{program.name}</span></p>
                {availableBatches.length > 0 ? (
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="batch-select" className="block text-sm font-medium text-gray-700">Batch Year</label>
                        <select
                            id="batch-select"
                            value={batch}
                            onChange={(e) => setBatch(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                        >
                            {availableBatches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                        <div className="mt-6 flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Proceed</button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <p className="text-center text-gray-500 bg-yellow-50 p-4 rounded-md">
                            No batches have been created for this program yet. Please contact an Administrator to set up batches.
                        </p>
                        <div className="mt-6 flex justify-end">
                             <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchSelectionModal;