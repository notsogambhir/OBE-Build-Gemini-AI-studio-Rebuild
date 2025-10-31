import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Section, Student, StudentStatus } from '../types';
import ExcelUploader from '../components/ExcelUploader';
import { Trash2 } from '../components/Icons';
import SaveBar from '../components/SaveBar';
import ConfirmationModal from '../components/ConfirmationModal';

const DepartmentStudentManagement: React.FC = () => {
    const { currentUser, data, setData } = useAppContext();

    const [selectedProgramId, setSelectedProgramId] = useState<string>('');
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [newSectionName, setNewSectionName] = useState('');

    // State for confirmation modal
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    // Draft state for student edits
    const [draftStudents, setDraftStudents] = useState<Student[]>([]);
    const [initialStudents, setInitialStudents] = useState<Student[]>([]);

    const programsInCollege = useMemo(() =>
        data.programs.filter(p => p.collegeId === currentUser?.collegeId)
    , [data.programs, currentUser]);

    const batchesForProgram = useMemo(() => {
        if (!selectedProgramId) return [];
        return data.batches
            .filter(b => b.programId === selectedProgramId)
            .sort((a, b) => b.name.localeCompare(a.name));
    }, [data.batches, selectedProgramId]);


    const { sections, students } = useMemo(() => {
        if (!selectedProgramId || !selectedBatch) {
            return { sections: [], students: [] };
        }
        const batch = data.batches.find(b => b.programId === selectedProgramId && b.name === selectedBatch);
        if (!batch) {
            return { sections: [], students: [] };
        }

        const sectionsForBatch = data.sections.filter(s => s.batchId === batch.id);
        const sectionIdsForBatch = new Set(sectionsForBatch.map(s => s.id));

        const allStudentsForProgram = data.students.filter(s => s.programId === selectedProgramId);

        // Include students in sections of this batch AND unassigned students for this program
        const studentsToDisplay = allStudentsForProgram.filter(s => 
            !s.sectionId || sectionIdsForBatch.has(s.sectionId)
        );
        
        return { sections: sectionsForBatch, students: studentsToDisplay.sort((a, b) => a.id.localeCompare(b.id)) };
    }, [selectedProgramId, selectedBatch, data.sections, data.students, data.batches]);
    
    useEffect(() => {
        setDraftStudents(students);
        setInitialStudents(students);
    }, [students]);

    const isDirty = useMemo(() => JSON.stringify(draftStudents) !== JSON.stringify(initialStudents), [draftStudents, initialStudents]);

    const handleStudentUpload = (uploadedStudents: { id: string; name: string }[]) => {
        if (!selectedProgramId) return;

        const existingStudentIds = new Set(data.students.map(s => String(s.id).toLowerCase()));
        const newStudents: Student[] = uploadedStudents
            .filter(row => row.id && row.name && !existingStudentIds.has(String(row.id).toLowerCase()))
            .map(row => ({
                id: String(row.id),
                name: String(row.name),
                programId: selectedProgramId,
                status: 'Active',
                sectionId: null
            }));

        setData(prev => ({
            ...prev,
            students: [...prev.students, ...newStudents]
        }));
        alert(`${newStudents.length} new students added to the master list. Please assign them to a section and batch.`);
    };
    
    const handleAddSection = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSectionName.trim() || !selectedProgramId || !selectedBatch) return;

        const batch = data.batches.find(b => b.programId === selectedProgramId && b.name === selectedBatch);
        if (!batch) {
            alert("Selected batch is invalid. Please refresh.");
            return;
        }

        const newSection: Section = {
            id: `sec_${Date.now()}`,
            name: newSectionName.trim().toUpperCase(),
            programId: selectedProgramId,
            batchId: batch.id,
        };
        setData(prev => ({...prev, sections: [...prev.sections, newSection]}));
        setNewSectionName('');
    };

    const performDeleteSection = (sectionId: string) => {
        setData(prev => {
            // 1. Filter out the deleted section
            const updatedSections = prev.sections.filter(s => s.id !== sectionId);
            
            // 2. Unassign students from that section
            const updatedStudents = prev.students.map(student => {
                if (student.sectionId === sectionId) {
                    return { ...student, sectionId: null };
                }
                return student;
            });
            
            return { 
                ...prev, 
                sections: updatedSections,
                students: updatedStudents 
            };
        });
        setConfirmation(null); // Close the modal
    };


    const handleDeleteSection = (sectionId: string) => {
         if (isDirty) {
            alert("Please save or cancel your pending student assignment changes before deleting a section.");
            return;
        }

        setConfirmation({
            isOpen: true,
            title: "Confirm Section Deletion",
            message: "Are you sure you want to delete this section? All students currently assigned to it will be unassigned.",
            onConfirm: () => performDeleteSection(sectionId),
        });
    };
    
    const handleStudentChange = (studentId: string, field: 'sectionId' | 'status', value: string | null) => {
        setDraftStudents(prev => prev.map(s => s.id === studentId ? { ...s, [field]: value } : s));
    };

    const handleSave = () => {
        setData(prev => {
            const draftStudentIds = new Set(draftStudents.map(s => s.id));
            const otherStudents = prev.students.filter(s => !draftStudentIds.has(s.id));
            return {
                ...prev,
                students: [...otherStudents, ...draftStudents]
            };
        });
        setInitialStudents(draftStudents);
        alert("Student assignments saved!");
    };
    
    const handleCancel = () => {
        setDraftStudents(initialStudents);
    };

    return (
        <div className="space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Select Program and Batch</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="program-select" className="block text-sm font-medium text-gray-700">Program</label>
                        <select id="program-select" value={selectedProgramId} onChange={e => setSelectedProgramId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="">-- Select Program --</option>
                            {programsInCollege.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="batch-select" className="block text-sm font-medium text-gray-700">Batch</label>
                        <select id="batch-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} disabled={!selectedProgramId} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100">
                            <option value="">-- Select Batch --</option>
                            {batchesForProgram.map(batch => <option key={batch.id} value={batch.name}>{batch.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {selectedProgramId && selectedBatch && (
                <>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Manage Sections</h2>
                        <div className="flex gap-4 items-start">
                             <form onSubmit={handleAddSection} className="flex-grow flex items-end gap-2">
                                <div className="flex-grow">
                                    <label htmlFor="section-name" className="block text-sm font-medium text-gray-700">New Section Name</label>
                                    <input id="section-name" type="text" value={newSectionName} onChange={e => setNewSectionName(e.target.value)} placeholder="e.g. A, B, C" className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900" required />
                                </div>
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg h-[42px]">Add Section</button>
                            </form>
                            <div className="flex flex-col items-center">
                                <p className="text-sm font-medium text-gray-700 mb-1">Current Sections</p>
                                <div className="flex flex-wrap gap-2">
                                {sections.map(s => (
                                    <div key={s.id} className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded-full">
                                        <span className="font-semibold text-gray-800">{s.name}</span>
                                        <button onClick={() => handleDeleteSection(s.id)} aria-label={`Delete section ${s.name}`} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                {sections.length === 0 && <p className="text-sm text-gray-500 italic">None</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Assign Students</h2>
                            <ExcelUploader<{ id: string; name: string; }> onFileUpload={handleStudentUpload} label="Upload Master Student List" format="cols: id, name" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {draftStudents.map(student => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 font-medium">{student.id}</td>
                                            <td className="px-6 py-4">{student.name}</td>
                                            <td className="px-6 py-4">
                                                <select value={student.sectionId || ''} onChange={e => handleStudentChange(student.id, 'sectionId', e.target.value || null)} className="p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-full">
                                                    <option value="">-- Unassigned --</option>
                                                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                 <select value={student.status} onChange={e => handleStudentChange(student.id, 'status', e.target.value as StudentStatus)} className="p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-full">
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
            <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
            {confirmation && (
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

export default DepartmentStudentManagement;