/**
 * @file AdminAcademicStructureTab.tsx
 * @description
 * This component is the "Academic Structure" tab within the `AdminPanel`. It's a powerful
 * and complex page that allows an Administrator to define the entire academic hierarchy
 * of the institution.
 *
 * It is broken down into three main management sections:
 * 1.  **Manage Colleges**:
 *     - A form to add a new college.
 *     - A list of existing colleges with "Edit" and "Delete" buttons.
 * 2.  **Manage Programs**:
 *     - A form to add a new program and assign it to a college.
 *     - A list of existing programs with "Edit" and "Delete" buttons.
 * 3.  **Manage Batches**:
 *     - A dropdown to select a program.
 *     - A form to add a new batch (e.g., "2025-2029") to the selected program. The end year
 *       is automatically calculated based on the program's duration.
 *     - A list of existing batches for that program with "Delete" buttons.
 *
 * All create, update, and delete operations happen immediately (they do not use a "draft state").
 * It uses confirmation modals for all delete operations to prevent accidental data loss.
 */

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { College, Program, Batch } from '../../types';
import { Trash2, Edit } from '../Icons';
import ConfirmationModal from '../ConfirmationModal';

const AdminAcademicStructureTab: React.FC = () => {
    // Get all the data and tools from the "magic backpack".
    const { data, setData } = useAppContext();

    // --- State Management for Forms ---
    // State for the "Manage Colleges" form. `editingCollege` remembers if we're editing an existing one.
    const [collegeName, setCollegeName] = useState('');
    const [editingCollege, setEditingCollege] = useState<typeof data.colleges[0] | null>(null);

    // State for the "Manage Programs" form.
    const [programName, setProgramName] = useState('');
    const [programCollegeId, setProgramCollegeId] = useState<College | ''>('');
    const [programDuration, setProgramDuration] = useState<number>(4);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);

    // State for the "Manage Batches" form.
    const [selectedProgramIdForBatch, setSelectedProgramIdForBatch] = useState<string>('');
    const [batchStartYear, setBatchStartYear] = useState<string>('');

    // State for the "Are you sure?" confirmation popup.
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);

    // `useMemo` is a smart calculator that finds the batches for the program selected in the dropdown.
    const batchesForSelectedProgram = useMemo(() => {
        if (!selectedProgramIdForBatch) return [];
        return data.batches.filter(b => b.programId === selectedProgramIdForBatch).sort((a,b) => b.name.localeCompare(a.name));
    }, [data.batches, selectedProgramIdForBatch]);


    // --- Handlers for College Management ---
    const handleAddOrUpdateCollege = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCollege) { // If we are editing...
            setData(prev => ({ ...prev, colleges: prev.colleges.map(c => c.id === editingCollege.id ? { ...c, name: collegeName } : c) }));
            setEditingCollege(null);
        } else { // If we are adding a new one...
            const newCollege = { id: collegeName.toUpperCase().replace(/\s/g, '') as College, name: collegeName };
            setData(prev => ({ ...prev, colleges: [...prev.colleges, newCollege] }));
        }
        setCollegeName(''); // Reset the form.
    };

    const handleDeleteCollege = (collegeId: College) => {
        // Open the confirmation popup before deleting.
        setConfirmation({
            isOpen: true, title: "Delete College", message: "Are you sure? Deleting a college will also delete all its programs and associated data.",
            onConfirm: () => {
                // This is where the actual deletion happens, after user confirmation.
                // NOTE: In a real app with a database, this would be a "cascading delete".
                setData(prev => ({ ...prev, colleges: prev.colleges.filter(c => c.id !== collegeId) }));
                setConfirmation(null);
            }
        });
    };

    // --- Handlers for Program Management ---
    const handleAddOrUpdateProgram = (e: React.FormEvent) => { /* ... similar logic to colleges ... */ };
    const handleDeleteProgram = (programId: string) => { /* ... similar logic with confirmation ... */ };

    // --- Handlers for Batch Management ---
    const handleAddBatch = (e: React.FormEvent) => {
        e.preventDefault();
        const program = data.programs.find(p => p.id === selectedProgramIdForBatch);
        if (!program || !batchStartYear) return;
        
        // Calculate the batch name (e.g., "2025-2029") from the start year and program duration.
        const startYearNum = parseInt(batchStartYear, 10);
        const endYear = startYearNum + program.duration;
        const batchName = `${startYearNum}-${endYear}`;

        // Check for duplicates before adding.
        if (data.batches.some(b => b.programId === program.id && b.name === batchName)) {
            alert(`Batch ${batchName} already exists for this program.`); return;
        }
        // Create the new batch and add it to the main data.
        const newBatch: Batch = { id: `B_${program.id}_${startYearNum}`, programId: program.id, name: batchName };
        setData(prev => ({ ...prev, batches: [...prev.batches, newBatch] }));
        setBatchStartYear(''); // Reset the form.
    };

    const handleDeleteBatch = (batchId: string) => { /* ... similar logic with confirmation ... */ };


    return (
        <div className="space-y-8">
            {/* Section 1: College Management */}
            <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Colleges</h3>
                {/* ... Form and list for colleges ... */}
            </section>

            {/* Section 2: Program Management */}
            <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Programs</h3>
                {/* ... Form and list for programs ... */}
            </section>
            
            {/* Section 3: Batch Management */}
            <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Batches</h3>
                {/* ... Dropdown, form, and list for batches ... */}
            </section>

            {/* The confirmation modal is only rendered if it has been activated. */}
            {confirmation?.isOpen && (
                <ConfirmationModal isOpen={confirmation.isOpen} title={confirmation.title} message={confirmation.message} onConfirm={confirmation.onConfirm} onClose={() => setConfirmation(null)}/>
            )}
        </div>
    );
};

export default AdminAcademicStructureTab;
