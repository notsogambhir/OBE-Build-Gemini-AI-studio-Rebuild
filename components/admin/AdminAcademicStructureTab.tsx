import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { College, Program, Batch } from '../../types';
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
    const [programDuration, setProgramDuration] = useState<number>(4);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);

    // State for Batches
    const [selectedProgramIdForBatch, setSelectedProgramIdForBatch] = useState<string>('');
    const [batchStartYear, setBatchStartYear] = useState<string>('');

    // State for confirmation
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);

    const batchesForSelectedProgram = useMemo(() => {
        if (!selectedProgramIdForBatch) return [];
        return data.batches.filter(b => b.programId === selectedProgramIdForBatch).sort((a, b) => b.name.localeCompare(a.name));
    }, [data.batches, selectedProgramIdForBatch]);


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

<<<<<<< HEAD
    // --- Handlers for Program Management ---
    const handleAddOrUpdateProgram = (e: React.FormEvent) => {
        e.preventDefault();
        if (!programName || !programCollegeId) return;

        if (editingProgram) {
            setData(prev => ({
                ...prev,
                programs: prev.programs.map(p => p.id === editingProgram.id ? { ...p, name: programName, collegeId: programCollegeId, duration: programDuration } : p)
            }));
            setEditingProgram(null);
        } else {
            const newProgram: Program = {
                id: `P_${Date.now()}`,
                name: programName,
                collegeId: programCollegeId,
                duration: programDuration,
            };
=======
    // Program Handlers
    const handleAddOrUpdateProgram = (e: React.FormEvent) => {
        e.preventDefault();
        if (!programCollegeId) return;
        if (editingProgram) {
            setData(prev => ({ ...prev, programs: prev.programs.map(p => p.id === editingProgram.id ? { ...p, name: programName, collegeId: programCollegeId, duration: programDuration } : p) }));
            setEditingProgram(null);
        } else {
            const newProgram: Program = { id: `P_${Date.now()}`, name: programName, collegeId: programCollegeId, duration: programDuration };
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)
            setData(prev => ({ ...prev, programs: [...prev.programs, newProgram] }));
        }
        setProgramName('');
        setProgramCollegeId('');
        setProgramDuration(4);
    };
<<<<<<< HEAD
    
    const handleDeleteProgram = (programId: string) => {
        setConfirmation({
            isOpen: true, title: "Delete Program", message: "Are you sure? Deleting a program will also delete its batches, courses, and other associated data.",
            onConfirm: () => {
                setData(prev => ({ ...prev, programs: prev.programs.filter(p => p.id !== programId) }));
                setConfirmation(null);
            }
        });
    };
=======
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)

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

    // Batch Handlers
    const handleAddBatch = (e: React.FormEvent) => {
        e.preventDefault();
        const program = data.programs.find(p => p.id === selectedProgramIdForBatch);
        if (!program || !batchStartYear) return;
<<<<<<< HEAD

        // Calculate the batch name (e.g., "2025-2029") from the start year and program duration.
=======
        
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)
        const startYearNum = parseInt(batchStartYear, 10);
        if (isNaN(startYearNum) || startYearNum < 2000 || startYearNum > 2100) {
            alert("Please enter a valid four-digit start year.");
            return;
        }

        const endYear = startYearNum + program.duration;
        const batchName = `${startYearNum}-${endYear}`;

        const batchExists = data.batches.some(b => b.programId === program.id && b.name === batchName);
        if (batchExists) {
            alert(`Batch ${batchName} already exists for this program.`);
            return;
        }

        const newBatch: Batch = {
            id: `B_${program.id}_${startYearNum}`,
            programId: program.id,
            name: batchName
        };

        setData(prev => ({ ...prev, batches: [...prev.batches, newBatch] }));
        setBatchStartYear('');
    };

    const handleDeleteBatch = (batchId: string) => {
        setConfirmation({
<<<<<<< HEAD
            isOpen: true, title: "Delete Batch", message: "Are you sure? Deleting a batch will also remove its sections and affect student assignments.",
            onConfirm: () => {
                setData(prev => ({ ...prev, batches: prev.batches.filter(b => b.id !== batchId) }));
=======
            isOpen: true,
            title: "Delete Batch",
            message: "Are you sure? Deleting this batch will remove associated sections and unassign students. This action cannot be undone.",
            onConfirm: () => {
                setData(prev => {
                    const sectionsToDelete = new Set(prev.sections.filter(s => s.batchId === batchId).map(s => s.id));
                    
                    // Unassign students from sections that will be deleted
                    const updatedStudents = prev.students.map(student => {
                        if (student.sectionId && sectionsToDelete.has(student.sectionId)) {
                            return { ...student, sectionId: null };
                        }
                        return student;
                    });

                    return {
                        ...prev,
                        batches: prev.batches.filter(b => b.id !== batchId),
                        sections: prev.sections.filter(s => s.batchId !== batchId),
                        students: updatedStudents,
                        assessments: prev.assessments.filter(a => !sectionsToDelete.has(a.sectionId)),
                    };
                });
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)
                setConfirmation(null);
            }
        });
    };
<<<<<<< HEAD
=======

>>>>>>> parent of ca350be (feat: Initialize app entry points and types)

    return (
        <div className="space-y-8">
            {/* College Management */}
            <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Colleges</h3>
<<<<<<< HEAD
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <form onSubmit={handleAddOrUpdateCollege} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium">{editingCollege ? 'Edit College' : 'Add New College'}</h4>
                        <div>
                            <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700">College Name</label>
                            <input type="text" id="collegeName" value={collegeName} onChange={e => setCollegeName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">{editingCollege ? 'Update' : 'Add'}</button>
                            {editingCollege && <button type="button" onClick={() => { setEditingCollege(null); setCollegeName(''); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>}
                        </div>
                    </form>
                    <div>
                        <h4 className="font-medium mb-2">Existing Colleges</h4>
                        <ul className="space-y-2">
                            {data.colleges.map(college => (
                                <li key={college.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                    <span>{college.name} ({college.id})</span>
                                    <div className="space-x-2">
                                        <button onClick={() => { setEditingCollege(college); setCollegeName(college.name); }} className="p-1 text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteCollege(college.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
=======
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
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)
                </div>
            </section>

            {/* Program Management */}
            <section>
<<<<<<< HEAD
                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-t pt-8">Manage Programs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <form onSubmit={handleAddOrUpdateProgram} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium">{editingProgram ? 'Edit Program' : 'Add New Program'}</h4>
                        <div>
                            <label htmlFor="programName" className="block text-sm font-medium text-gray-700">Program Name</label>
                            <input type="text" id="programName" value={programName} onChange={e => setProgramName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="programCollege" className="block text-sm font-medium text-gray-700">College</label>
                            <select id="programCollege" value={programCollegeId} onChange={e => setProgramCollegeId(e.target.value as College)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
                                <option value="">-- Select College --</option>
                                {data.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="programDuration" className="block text-sm font-medium text-gray-700">Duration (years)</label>
                            <input type="number" id="programDuration" value={programDuration} onChange={e => setProgramDuration(Number(e.target.value))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">{editingProgram ? 'Update' : 'Add'}</button>
                            {editingProgram && <button type="button" onClick={() => { setEditingProgram(null); setProgramName(''); setProgramCollegeId(''); setProgramDuration(4); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>}
                        </div>
                    </form>
                    <div>
                        <h4 className="font-medium mb-2">Existing Programs</h4>
                        <ul className="space-y-2 max-h-96 overflow-y-auto">
                            {data.programs.map(program => (
                                <li key={program.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                    <div>
                                        <p className="font-medium">{program.name}</p>
                                        <p className="text-sm text-gray-500">{data.colleges.find(c=>c.id === program.collegeId)?.name}</p>
                                    </div>
                                    <div className="space-x-2">
                                        <button onClick={() => { setEditingProgram(program); setProgramName(program.name); setProgramCollegeId(program.collegeId); setProgramDuration(program.duration); }} className="p-1 text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteProgram(program.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
=======
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Programs</h3>
                <form onSubmit={handleAddOrUpdateProgram} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
                     <div className="md:col-span-2">
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Duration (Yrs)</label>
                        <input type="number" value={programDuration} min="1" max="6" onChange={e => setProgramDuration(Number(e.target.value))} className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
                    <div className="md:col-span-4 flex gap-2">
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">{editingProgram ? 'Update Program' : 'Add Program'}</button>
                        {editingProgram && <button type="button" onClick={() => { setEditingProgram(null); setProgramName(''); setProgramCollegeId(''); setProgramDuration(4); }} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Cancel</button>}
                    </div>
                </form>
                 <div className="space-y-2">
                    {data.programs.map(program => (
                        <div key={program.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                            <span>{program.name} ({data.colleges.find(c => c.id === program.collegeId)?.name}) - {program.duration} years</span>
                            <div className="space-x-2">
                                <button onClick={() => { setEditingProgram(program); setProgramName(program.name); setProgramCollegeId(program.collegeId); setProgramDuration(program.duration); }} className="text-indigo-600"><Edit /></button>
                                <button onClick={() => handleDeleteProgram(program.id)} className="text-red-600"><Trash2 /></button>
                            </div>
                        </div>
                    ))}
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)
                </div>
            </section>
            
            {/* Batch Management */}
            <section>
<<<<<<< HEAD
                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-t pt-8">Manage Batches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="programForBatch" className="block text-sm font-medium text-gray-700">Select Program</label>
                        <select id="programForBatch" value={selectedProgramIdForBatch} onChange={e => setSelectedProgramIdForBatch(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
                            <option value="">-- Select a Program --</option>
                            {data.programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        
                        {selectedProgramIdForBatch && (
                            <form onSubmit={handleAddBatch} className="space-y-4 p-4 mt-4 border rounded-lg bg-gray-50">
                                <h4 className="font-medium">Add New Batch</h4>
                                <div>
                                    <label htmlFor="batchStartYear" className="block text-sm font-medium text-gray-700">Start Year (e.g., 2025)</label>
                                    <input type="number" id="batchStartYear" value={batchStartYear} onChange={e => setBatchStartYear(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="2025" required />
                                </div>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add Batch</button>
                            </form>
                        )}
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Existing Batches for Selected Program</h4>
                        <ul className="space-y-2 max-h-96 overflow-y-auto">
                            {batchesForSelectedProgram.map(batch => (
                                <li key={batch.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                    <span>{batch.name}</span>
                                    <button onClick={() => handleDeleteBatch(batch.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                                </li>
                            ))}
                            {selectedProgramIdForBatch && batchesForSelectedProgram.length === 0 && <p className="text-sm text-gray-500">No batches found.</p>}
                        </ul>
                    </div>
                </div>
=======
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Batches</h3>
                 <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Select Program to Manage Batches For</label>
                    <select value={selectedProgramIdForBatch} onChange={e => setSelectedProgramIdForBatch(e.target.value)} className="mt-1 w-full max-w-lg p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                        <option value="">-- Select a Program --</option>
                        {data.programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                {selectedProgramIdForBatch && (
                    <>
                        <form onSubmit={handleAddBatch} className="flex gap-4 items-end mb-4 p-4 border rounded-md bg-gray-50">
                            <div className="flex-grow">
                                <label className="block text-sm font-medium text-gray-700">New Batch Start Year</label>
                                <input type="number" placeholder="e.g., 2025" value={batchStartYear} onChange={e => setBatchStartYear(e.target.value)} className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                            </div>
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add Batch</button>
                        </form>
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-600">Existing Batches:</h4>
                            {batchesForSelectedProgram.map(batch => (
                                <div key={batch.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                    <span>{batch.name}</span>
                                    <button onClick={() => handleDeleteBatch(batch.id)} className="text-red-600"><Trash2 /></button>
                                </div>
                            ))}
                            {batchesForSelectedProgram.length === 0 && <p className="text-sm text-gray-500">No batches found for this program.</p>}
                        </div>
                    </>
                )}
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)
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