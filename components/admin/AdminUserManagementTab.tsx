import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User } from '../../types';
import UserEditModal from './UserEditModal';
import { Edit, Trash2 } from '../Icons';
import ConfirmationModal from '../ConfirmationModal';

const AdminUserManagementTab: React.FC = () => {
  const { data, setData } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmation, setConfirmation] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);


  const filteredUsers = useMemo(() => {
    if (!searchTerm) return data.users;
    return data.users.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.users, searchTerm]);

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    setConfirmation({
        isOpen: true,
        title: "Delete User",
        message: "Are you sure you want to delete this user? This cannot be undone.",
        onConfirm: () => {
            setData(prev => ({
                ...prev,
                users: prev.users.filter(u => u.id !== userId)
            }));
            setConfirmation(null);
        }
    });
  };

  const getAssignmentInfo = (user: User): string => {
      switch (user.role) {
          case 'Department':
              return user.collegeId || 'N/A';
          case 'Program Co-ordinator':
              return data.programs.find(p => p.id === user.programId)?.name || 'N/A';
          case 'Teacher':
              const pcNames = user.programCoordinatorIds
                  ?.map(pcId => data.users.find(u => u.id === pcId)?.name)
                  .filter(Boolean)
                  .join(', ');
              return pcNames || 'N/A';
          default:
              return 'N/A';
      }
  };


  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full max-w-sm p-2 border border-gray-300 rounded-md"
            />
            <button onClick={handleAddNew} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                Add New User
            </button>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.username}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getAssignmentInfo(user)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900"><Edit /></button>
                                <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 ml-4"><Trash2 /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {isModalOpen && (
            <UserEditModal
                userToEdit={editingUser}
                onClose={() => setIsModalOpen(false)}
            />
        )}
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

export default AdminUserManagementTab;
