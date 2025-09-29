import React, { useState } from 'react';
import { Course } from '../types';
import Modal from './Modal';

interface AddCourseModalProps {
  onClose: () => void;
  onAdd: (course: Course) => void;
  programId: string;
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({ onClose, onAdd, programId }) => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [target, setTarget] = useState(50);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newCourse: Course = {
            id: `c_manual_${Date.now()}`,
            programId,
            code,
            name,
            target,
            internalWeightage: 25,
            externalWeightage: 75,
            attainmentLevels: { level3: 80, level2: 70, level1: 50 },
            status: 'Future', // Default status for new courses
        };
        onAdd(newCourse);
    }

    return (
        <Modal title="Add New Course" onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Course Code</label>
                    <input type="text" value={code} onChange={e => setCode(e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Course Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Target Attainment (%)</label>
                    <input type="number" value={target} onChange={e => setTarget(Number(e.target.value))} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required/>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Add Course</button>
                </div>
            </form>
        </Modal>
    )
}

export default AddCourseModal;