import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { User, Program } from '../types';

const UserManagement: React.FC = () => {
    const { data, setData, currentUser } = useAppContext();

    if (currentUser?.role !== 'Admin') {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="text-gray-500 mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    const { programCoordinators, teachers, programs } = useMemo(() => ({
        programCoordinators: data.users.filter(u => u.role === 'Program Co-ordinator'),
        teachers: data.users.filter(u => u.role === 'Teacher'),
        programs: data.programs,
    }), [data]);

    const handleProgramAssignment = (programId: string, pcId: string) => {
        setData(prev => {
            const users = prev.users.map(user => {
                // If this user is the newly assigned PC, set their programId
                if (user.id === pcId) {
                    return { ...user, programId };
                }
                // If this user was previously assigned to this program, unassign them
                if (user.role === 'Program Co-ordinator' && user.programId === programId) {
                    const { programId: _, ...rest } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
                    return rest;
                }
                return user;
            });
            return { ...prev, users };
        });
    };

    const handleTeacherAssignment = (teacherId: string, pcId: string) => {
        setData(prev => ({
            ...prev,
            users: prev.users.map(user => {
                if (user.id === teacherId) {
                    return { ...user, programCoordinatorId: pcId || undefined };
                }
                return user;
            })
        }));
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>

            {/* Program Co-ordinator Management - NEW UI */}
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
                            {programs.map(program => {
                                const assignedPC = programCoordinators.find(pc => pc.programId === program.id);
                                return (
                                    <tr key={program.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{program.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <select
                                                value={assignedPC?.id || ''}
                                                onChange={(e) => handleProgramAssignment(program.id, e.target.value)}
                                                className="p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="">-- Unassigned --</option>
                                                {programCoordinators.map(pc => (
                                                    <option key={pc.id} value={pc.id}>{pc.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Teacher Management */}
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
                                            value={teacher.programCoordinatorId || ''}
                                            onChange={(e) => handleTeacherAssignment(teacher.id, e.target.value)}
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
        </div>
    );
};

export default UserManagement;