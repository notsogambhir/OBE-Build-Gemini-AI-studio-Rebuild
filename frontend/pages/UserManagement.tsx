import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { User, Program } from '../types';
import SaveBar from '../components/SaveBar';

const UserManagement: React.FC = () => {
    const { data, setData, currentUser } = useAppContext();

    const { programCoordinators, teachers, programs } = useMemo(() => {
        if (!data) return { programCoordinators: [], teachers: [], programs: [] };
        return {
            programCoordinators: data.users.filter(u => u.role === 'Program Co-ordinator'),
            teachers: data.users.filter(u => u.role === 'Teacher'),
            programs: data.programs,
        }
    }, [data]);

    // --- Draft State Management ---
    const [draftPcAssignments, setDraftPcAssignments] = useState<{ [programId: string]: string }>({});
    const [initialPcAssignments, setInitialPcAssignments] = useState<{ [programId: string]: string }>({});
    const [draftTeacherAssignments, setDraftTeacherAssignments] = useState<{ [teacherId: string]: string[] }>({});
    const [initialTeacherAssignments, setInitialTeacherAssignments] = useState<{ [teacherId: string]: string[] }>({});

    useEffect(() => {
        // Init PC assignments
        const pcAssignments: { [programId: string]: string } = {};
        programs.forEach(p => {
            const assignedPC = programCoordinators.find(pc => pc.programId === p.id);
            pcAssignments[p.id] = assignedPC ? assignedPC.id : '';
        });
        setDraftPcAssignments(pcAssignments);
        setInitialPcAssignments(pcAssignments);

        // Init Teacher assignments
        const teacherAssignments: { [teacherId: string]: string[] } = {};
        teachers.forEach(t => {
            teacherAssignments[t.id] = t.programCoordinatorIds || [];
        });
        setDraftTeacherAssignments(teacherAssignments);
        setInitialTeacherAssignments(teacherAssignments);
    }, [programs, programCoordinators, teachers]);

    const isDirty = useMemo(() => 
        JSON.stringify(draftPcAssignments) !== JSON.stringify(initialPcAssignments) ||
        JSON.stringify(draftTeacherAssignments) !== JSON.stringify(initialTeacherAssignments),
    [draftPcAssignments, initialPcAssignments, draftTeacherAssignments, initialTeacherAssignments]);


    const handleProgramAssignmentChange = (programId: string, pcId: string) => {
        setDraftPcAssignments(prev => ({...prev, [programId]: pcId}));
    };
    
    const handleTeacherAssignmentChange = (teacherId: string, pcId: string) => {
        setDraftTeacherAssignments(prev => ({...prev, [teacherId]: pcId ? [pcId] : []}));
    };

    const handleSave = () => {
        // TODO: Replace with API call
        if (!setData) return;
        setData(prev => {
            if (!prev) return null;
            const updatedUsers = prev.users.map(user => {
                let updatedUser = { ...user };
                
                // Apply PC assignment changes
                if (updatedUser.role === 'Program Co-ordinator') {
                    const assignedProgramId = Object.keys(draftPcAssignments).find(
                        progId => draftPcAssignments[progId] === updatedUser.id
                    );
                    if (assignedProgramId) {
                        updatedUser.programId = assignedProgramId;
                    } else if (updatedUser.programId && !Object.values(draftPcAssignments).includes(updatedUser.id)) {
                        delete updatedUser.programId;
                    }
                }
                
                // Apply Teacher assignment changes
                if (updatedUser.role === 'Teacher') {
                    // Check if there's a draft entry for this teacher before updating
                    if (draftTeacherAssignments[updatedUser.id] !== undefined) {
                        updatedUser.programCoordinatorIds = draftTeacherAssignments[updatedUser.id];
                    }
                }
                
                return updatedUser;
            });
            return { ...prev, users: updatedUsers };
        });
        
        setInitialPcAssignments(draftPcAssignments);
        setInitialTeacherAssignments(draftTeacherAssignments);
        alert("User assignments saved!");
    };
    
    const handleCancel = () => {
        setDraftPcAssignments(initialPcAssignments);
        setDraftTeacherAssignments(initialTeacherAssignments);
    };


    if (currentUser?.role !== 'Admin') {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="text-gray-500 mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    if (!data) return <div>Loading user data...</div>;

    return (
        <div className="space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Program Assignments</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Program Co-ordinator</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {programs.map(program => (
                                <tr key={program.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{program.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <select
                                            value={draftPcAssignments[program.id] || ''}
                                            onChange={(e) => handleProgramAssignmentChange(program.id, e.target.value)}
                                            className="p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">-- Unassigned --</option>
                                            {programCoordinators.map(pc => (
                                                <option key={pc.id} value={pc.id}>{pc.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports to (Co-ordinator)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {teachers.map(teacher => (
                                <tr key={teacher.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <select
                                            value={draftTeacherAssignments[teacher.id]?.[0] || ''}
                                            onChange={(e) => handleTeacherAssignmentChange(teacher.id, e.target.value)}
                                            className="p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">-- Unassigned --</option>
                                            {programCoordinators.map(pc => (
                                                <option key={pc.id} value={pc.id}>{pc.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
};

export default UserManagement;
