import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { ProgramOutcome } from '../types';
import Modal from './Modal';

interface AddProgramOutcomeModalProps {
  onClose: () => void;
}

const AddProgramOutcomeModal: React.FC<AddProgramOutcomeModalProps> = ({ onClose }) => {
  const { setData, selectedProgram } = useAppContext();
  const [number, setNumber] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim() || !description.trim() || !selectedProgram || !setData) {
      alert("Please fill out all fields.");
      return;
    }
    // TODO: Replace with API call
    const newPO: ProgramOutcome = {
      id: `po_manual_${Date.now()}`,
      programId: selectedProgram.id,
      number: number.trim(),
      description: description.trim()
    };
    setData(prev => prev ? ({
      ...prev,
      programOutcomes: [...prev.programOutcomes, newPO]
    }) : null);
    onClose();
  };

  return (
    <Modal title="Add New Program Outcome" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">PO Number (e.g., PO1)</label>
          <input
            type="text"
            value={number}
            onChange={e => setNumber(e.target.value)}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div className="flex justify-end pt-4 gap-3">
          <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Add PO</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProgramOutcomeModal;
