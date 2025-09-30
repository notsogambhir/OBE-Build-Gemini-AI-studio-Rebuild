import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { User } from '../types';
import Modal from '../components/Modal';
import { Edit } from '../components/Icons';
import SaveBar from '../components/SaveBar';

interface TeacherAssignmentModalProps {
  teacher: User;
  onClose: () => void;
}

const TeacherAssignmentModal: React.FC<TeacherAssignmentModalProps> = ({ teacher, onClose }) => {
    const { currentUser, data, setData } = useAppContext();
    const [selectedPcIds, setSelectedPcIds] = useState<string[]>(teacher.programCoordinatorIds || []);
    
    const programCoordinators = useMemo(() =>
        data.users.filter(u => u.role === 'Program Co-ordinator' && u.departmentId === currentUser?.id)
    , [data.users, currentUser]);

    const handleCheckboxChange = (pcId: string, isChecked: boolean) => {
        setSelectedPcIds(prev => isChecked ? [...prev, pcId] : prev.filter(id => id !== pcId));
    };

    const handleSave = () => {
        setData(prev => ({
            ...prev,
            users: prev.users.map(u => u.id === teacher.id ? {...u, programCoordinatorIds: selectedPcIds } : u)
        }));
        onClose();
    };

    return (
        <Modal title={`Assign Co-ordinators for ${teacher.name}`} onClose={onClose}>
            <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600">Select the Program Co-ordinators this teacher will report to.</p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {programCoordinators.map(pc => (
                        <label key={pc.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedPcIds.includes(pc.id)}
                                onChange={e => handleCheckboxChange(pc.id, e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-3 text-gray-800 font-medium">{pc.name}</span>
                        </label>
                    ))}
                </div>
                <div className="flex justify-end pt-4 gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Save Assignments</button>
                </div>
            </div>
        </Modal>
    );
};


const DepartmentFacultyManagement: React.FC = () => {
    const { currentUser, data, setData } = useAppContext();
    const [editingTeacher, setEditingTeacher] = useState<User | null>(null);

    const { programs, programCoordinators, teachers } = useMemo(() => {
        if (!currentUser?.collegeId) return { programs: [], programCoordinators: [], teachers: [] };
        
        const collegePrograms = data.programs.filter(p => p.collegeId === currentUser.collegeId);
        
        const collegePcs = data.users.filter(u => u.role === 'Program Co-ordinator' && u.departmentId === currentUser.id);

        const pcIds = new Set(collegePcs.map(pc => pc.id));
        const collegeTeachers = data.users.filter(u => u.role === 'Teacher' && (u.programCoordinatorIds || []).some(id => pcIds.has(id)));

        return { programs: collegePrograms, programCoordinators: collegePcs, teachers: collegeTeachers };
    }, [currentUser, data]);

    const [draftPcAssignments, setDraftPcAssignments] = useState<{ [programId: string]: string }>({});
    const [initialPcAssignments, setInitialPcAssignments] = useState<{ [programId: string]: string }>({});

    useEffect(() => {
        const assignments: { [programId: string]: string } = {};
        programs.forEach(p => {
            const assignedPC = programCoordinators.find(pc => pc.programId === p.id);
            assignments[p.id] = assignedPC ? assignedPC.id : '';
        });
        setDraftPcAssignments(assignments);
        setInitialPcAssignments(assignments);
    }, [programs, programCoordinators]);

    const isDirty = useMemo(() => JSON.stringify(draftPcAssignments) !== JSON.stringify(initialPcAssignments), [draftPcAssignments, initialPcAssignments]);

    const handleProgramAssignmentChange = (programId: string, pcId: string) => {
        setDraftPcAssignments(prev => ({ ...prev, [programId]: pcId }));
    };

    const handleSave = () => {
        setData(prev => {
            const updatedUsers = prev.users.map(user => {
                // First, unassign all PCs managed by this department head
                if (user.role === 'Program Co-ordinator' && user.departmentId === currentUser?.id) {
                    const { programId, ...rest } = user;
                    return rest;
                }
                return user;
            }).map(user => {
                // Now, re-assign based on the draft state
                const assignedProgramId = Object.keys(draftPcAssignments).find(
                    progId => draftPcAssignments[progId] === user.id
                );
                if (assignedProgramId) {
                    return { ...user, programId: assignedProgramId };
                }
                return user;
            });

            return { ...prev, users: updatedUsers };
        });
        setInitialPcAssignments(draftPcAssignments);
        alert("PC assignments saved successfully!");
    };

    const handleCancel = () => {
        setDraftPcAssignments(initialPcAssignments);
    };
    
    return (
        <div className="space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-gray-800">Faculty Management</h1>

             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Program Co-ordinator Assignments</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned PC</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                             {programs.map(program => {
                                return (
                                    <tr key={program.id}>
                                        <td className="px-6 py-4 font-medium">{program.name}</td>
                                        <td className="px-6 py-4">
                                            <select value={draftPcAssignments[program.id] || ''} onChange={e => handleProgramAssignmentChange(program.id, e.target.value)} className="p-2 border rounded-md bg-white text-gray-900 w-full max-w-xs">
                                                 <option value="">-- Unassigned --</option>
                                                 {programCoordinators.map(pc => <option key={pc.id} value={pc.id}>{pc.name}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Teacher Assignments</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports To</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-200">
                            {teachers.map(teacher => {
                                const assignedPcs = programCoordinators.filter(pc => teacher.programCoordinatorIds?.includes(pc.id));
                                return (
                                <tr key={teacher.id}>
                                    <td className="px-6 py-4 font-medium">{teacher.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {assignedPcs.length > 0 ? assignedPcs.map(pc => pc.name).join(', ') : <span className="text-gray-400 italic">Unassigned</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => setEditingTeacher(teacher)} className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center justify-end gap-1">
                                            <Edit className="w-4 h-4" /> Manage
                                        </button>
                                    </td>
                                </tr>
                            )})}
                         </tbody>
                    </table>
                </div>
            </div>

            {editingTeacher && (
                <TeacherAssignmentModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} />
            )}

            <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
};

export default DepartmentFacultyManagement;