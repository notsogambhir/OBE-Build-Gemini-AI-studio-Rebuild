import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User, Role } from '../../types';
import Modal from '../Modal';

interface UserEditModalProps {
  userToEdit: User | null;
  onClose: () => void;
}

const API_URL = 'http://127.0.0.1:8000';

const UserEditModal: React.FC<UserEditModalProps> = ({ userToEdit, onClose }) => {
    const { data, setData } = useAppContext();
    
    const [user, setUser] = useState<Partial<User>>({
        id: userToEdit?.id, // ID is undefined for new users, will be set by backend
        employeeId: userToEdit?.employeeId || '',
        name: userToEdit?.name || '',
        username: userToEdit?.username || '',
        password: '',
        role: userToEdit?.role || 'Teacher',
        collegeId: userToEdit?.collegeId,
        departmentId: userToEdit?.departmentId,
        programId: userToEdit?.programId,
        programCoordinatorIds: userToEdit?.programCoordinatorIds || [],
    });

    const roles: Role[] = ['Teacher', 'Program Co-ordinator', 'Department', 'University', 'Admin'];

    const handleInputChange = (field: keyof User, value: any) => {
        setUser(prev => ({ ...prev, [field]: value }));
    };
    
    const handleMultiSelectChange = (field: keyof User, selectedOptions: string[]) => {
         setUser(prev => ({...prev, [field]: selectedOptions}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user.name || !user.username || !user.employeeId || (!userToEdit && !user.password)) {
            alert('Please fill all required fields.');
            return;
        }

        if (userToEdit) {
            // Update logic remains client-side for now, as requested focus is on CREATE.
            if (!setData) return;
            setData(prev => {
                if (!prev) return null;
                const updatedUser = { 
                    ...prev.users.find(u => u.id === userToEdit.id), 
                    ...user,
                    id: userToEdit.id, 
                    // Do not overwrite password if field is blank on edit
                    password: user.password || prev.users.find(u => u.id === userToEdit.id)?.password
                } as User;
                return {
                    ...prev,
                    users: prev.users.map(u => u.id === userToEdit.id ? updatedUser : u)
                };
            });
            onClose();
        } else {
            // CREATE User via API
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Authentication error. Please log in again.');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/users/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`
                    },
                    body: JSON.stringify(user)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    const errorMessage = Object.entries(errorData)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('\n');
                    throw new Error(errorMessage || 'Failed to create user.');
                }

                const newUserFromApi = await response.json();

                if (setData) {
                    setData(prev => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            users: [...prev.users, newUserFromApi]
                        };
                    });
                }
                onClose();

            } catch (error: any) {
                alert(`Error creating user: ${error.message}`);
            }
        }
    };
    
    const departmentHeads = data?.users.filter(u => u.role === 'Department') ?? [];
    const programCoordinators = data?.users.filter(u => u.role === 'Program Co-ordinator') ?? [];

    return (
        <Modal title={userToEdit ? 'Edit User' : 'Add New User'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" value={user.name} onChange={e => handleInputChange('name', e.target.value)} className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                        <input type="text" value={user.employeeId} onChange={e => handleInputChange('employeeId', e.target.value)} className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input type="text" value={user.username} onChange={e => handleInputChange('username', e.target.value)} className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" value={user.password} onChange={e => handleInputChange('password', e.target.value)} className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder={userToEdit ? 'Leave blank to keep unchanged' : ''} required={!userToEdit} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select value={user.role} onChange={e => handleInputChange('role', e.target.value)} className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>

                {/* Role-specific assignment fields */}
                {user.role === 'Department' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Assign to College</label>
                        <select value={user.collegeId || ''} onChange={e => handleInputChange('collegeId', e.target.value)} className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="">-- Select College --</option>
                            {data?.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                )}
                {user.role === 'Program Co-ordinator' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Assign to Department Head</label>
                        <select value={user.departmentId || ''} onChange={e => handleInputChange('departmentId', e.target.value)} className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="">-- Select Department Head --</option>
                            {departmentHeads.map(d => <option key={d.id} value={d.id}>{d.name} ({d.collegeId})</option>)}
                        </select>
                    </div>
                )}
                 {user.role === 'Teacher' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Assign to Program Co-ordinator(s)</label>
                         <select
                            multiple
                            value={user.programCoordinatorIds}
                            onChange={e => handleMultiSelectChange('programCoordinatorIds', Array.from(e.target.selectedOptions, option => option.value))}
                            className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32"
                        >
                            {programCoordinators.map(pc => <option key={pc.id} value={pc.id}>{pc.name} ({data?.programs.find(p=>p.id === pc.programId)?.name})</option>)}
                        </select>
                         <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple.</p>
                    </div>
                )}

                <div className="flex justify-end pt-4 gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">{userToEdit ? 'Save Changes' : 'Create User'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default UserEditModal;