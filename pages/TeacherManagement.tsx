import React, { useMemo, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Link } from 'react-router-dom';

const TeacherManagement: React.FC = () => {
    const { data, setData, currentUser } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');

    const managedTeachers = useMemo(() => {
        if (currentUser?.role !== 'Program Co-ordinator') return [];
        
        let teachers = data.users.filter(u => u.role === 'Teacher' && u.programCoordinatorId === currentUser.id);

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            teachers = teachers.filter(teacher =>
                teacher.name.toLowerCase().includes(lowercasedFilter)
            );
        }
        
        return teachers;
    }, [data.users, currentUser, searchTerm]);

    const handleStatusChange = (teacherId: string, status: 'Active' | 'Inactive') => {
        setData(prev => ({
            ...prev,
            users: prev.users.map(u => u.id === teacherId ? { ...u, status } : u)
        }));
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Teacher Management</h1>
            <p className="text-gray-500">Manage teachers and course assignments for your program.</p>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                  <input
                    type="text"
                    placeholder="Search by Teacher Name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {managedTeachers.length > 0 ? (
                            managedTeachers.map(teacher => (
                                <tr key={teacher.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {teacher.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <select
                                            value={teacher.status}
                                            onChange={(e) => handleStatusChange(teacher.id, e.target.value as 'Active' | 'Inactive')}
                                            className={`p-1 border rounded-md bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 ${teacher.status === 'Active' ? 'border-green-300' : 'border-red-300'}`}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/teachers/${teacher.id}`} className="text-indigo-600 hover:text-indigo-800 font-semibold">
                                            View Dashboard
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={3} className="text-center py-8 text-gray-500">
                                    No teachers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherManagement;