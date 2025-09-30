import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { College, Program } from '../../types';
import { Trash2, Edit } from '../Icons';
import ConfirmationModal from '../ConfirmationModal';

const AdminAcademicStructureTab: React.FC = () => {
    const { data, setData } = useAppContext();

    // State for Colleges
    const [collegeName, setCollegeName] = useState('');
    const [editingCollege, setEditingCollege] = useState<typeof data.colleges[0] | null>(null);

    // State for Programs
    const [programName, setProgramName] = useState('');
    const [programCollegeId, setProgramCollegeId] = useState<College | ''>('');
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);

    // State for confirmation
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);

    // College Handlers
    const handleAddOrUpdateCollege = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCollege) {
            setData(prev => ({ ...prev, colleges: prev.colleges.map(c => c.id === editingCollege.id ? { ...c, name: collegeName } : c) }));
            setEditingCollege(null);
        } else {
            const newCollege = { id: collegeName.toUpperCase() as College, name: collegeName };
            setData(prev => ({ ...prev, colleges: [...prev.colleges, newCollege] }));
        }
        setCollegeName('');
    };

    const handleDeleteCollege = (collegeId: College) => {
        setConfirmation({
            isOpen: true, title: "Delete College", message: "Are you sure? Deleting a college will also delete all its programs and associated data.",
            onConfirm: () => {
                setData(prev => {
                    const programsToDelete = prev.programs.filter(p => p.collegeId === collegeId).map(p => p.id);
                    return {
                        ...prev,
                        colleges: prev.colleges.filter(c => c.id !== collegeId),
                        programs: prev.programs.filter(p => p.collegeId !== collegeId),
                        // Further cascade deletion would be needed in a real app
                    }
                });
                setConfirmation(null);
            }
        });
    };

    // Program Handlers
    const handleAddOrUpdateProgram = (e: React.FormEvent) => {
        e.preventDefault();
        if (!programCollegeId) return;
        if (editingProgram) {
            setData(prev => ({ ...prev, programs: prev.programs.map(p => p.id === editingProgram.id ? { ...p, name: programName, collegeId: programCollegeId } : p) }));
            setEditingProgram(null);
        } else {
            const newProgram: Program = { id: `P_${Date.now()}`, name: programName, collegeId: programCollegeId };
            setData(prev => ({ ...prev, programs: [...prev.programs, newProgram] }));
        }
        setProgramName('');
        setProgramCollegeId('');
    };

    const handleDeleteProgram = (programId: string) => {
        setConfirmation({
            isOpen: true, title: "Delete Program", message: "Are you sure? Deleting a program will also delete all its courses and associated data.",
            onConfirm: () => {
                setData(prev => ({
                    ...prev,
                    programs: prev.programs.filter(p => p.id !== programId),
                     // Further cascade deletion would be needed in a real app
                }));
                setConfirmation(null);
            }
        });
    };


    return (
        <div className="space-y-8">
            {/* College Management */}
            <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Colleges</h3>
                <form onSubmit={handleAddOrUpdateCollege} className="flex gap-4 items-end mb-4">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700">College Name</label>
                        <input type="text" value={collegeName} onChange={e => setCollegeName(e.target.value)} className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">{editingCollege ? 'Update' : 'Add'}</button>
                    {editingCollege && <button type="button" onClick={() => { setEditingCollege(null); setCollegeName(''); }} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Cancel</button>}
                </form>
                <div className="space-y-2">
                    {data.colleges.map(college => (
                        <div key={college.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                            <span>{college.name} ({college.id})</span>
                            <div className="space-x-2">
                                <button onClick={() => { setEditingCollege(college); setCollegeName(college.name); }} className="text-indigo-600"><Edit /></button>
                                <button onClick={() => handleDeleteCollege(college.id)} className="text-red-600"><Trash2 /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Program Management */}
            <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Programs</h3>
                <form onSubmit={handleAddOrUpdateProgram} className="flex gap-4 items-end mb-4">
                     <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700">Program Name</label>
                        <input type="text" value={programName} onChange={e => setProgramName(e.target.value)} className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">College</label>
                         <select value={programCollegeId} onChange={e => setProgramCollegeId(e.target.value as College)} className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                            <option value="">Select College</option>
                            {data.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">{editingProgram ? 'Update' : 'Add'}</button>
                    {editingProgram && <button type="button" onClick={() => { setEditingProgram(null); setProgramName(''); setProgramCollegeId('') }} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Cancel</button>}
                </form>
                 <div className="space-y-2">
                    {data.programs.map(program => (
                        <div key={program.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                            <span>{program.name} ({data.colleges.find(c => c.id === program.collegeId)?.name})</span>
                            <div className="space-x-2">
                                <button onClick={() => { setEditingProgram(program); setProgramName(program.name); setProgramCollegeId(program.collegeId) }} className="text-indigo-600"><Edit /></button>
                                <button onClick={() => handleDeleteProgram(program.id)} className="text-red-600"><Trash2 /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {confirmation?.isOpen && (
                <ConfirmationModal 
                    isOpen={confirmation.isOpen}
                    title={confirmation.title}
                    message={confirmation.message}
                    onConfirm={confirmation.onConfirm}
                    onClose={() => setConfirmation(null)}
                />
            )}
        </div>
    );
};

export default AdminAcademicStructureTab;