import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Modal from './Modal';
import { Assessment } from '../types';

interface CreateAssessmentModalProps {
  courseId: string;
  onClose: () => void;
}

const CreateAssessmentModal: React.FC<CreateAssessmentModalProps> = ({ courseId, onClose }) => {
  const { setData } = useAppContext();
  const [name, setName] = useState('');
  const [type, setType] = useState<'Internal' | 'External'>('Internal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please provide an assessment name.");
      return;
    }
    // TODO: Replace with API call
    const newAssessment: Assessment = {
      id: `as_${Date.now()}`,
      courseId,
      name: name.trim(),
      type,
      questions: []
    };
    
    if (setData) {
        setData(prev => prev ? ({
            ...prev,
            assessments: [...prev.assessments, newAssessment]
        }) : null);
    }
    
    onClose();
  };

  return (
    <Modal title="Create New Assessment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Assessment Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Assessment Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as 'Internal' | 'External')}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Internal">Internal</option>
            <option value="External">External</option>
          </select>
        </div>
        <div className="flex justify-end pt-4 gap-3">
            <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Create</button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAssessmentModal;
