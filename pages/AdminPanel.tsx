import React from 'react';
import AdminAcademicStructureTab from '../components/admin/AdminAcademicStructureTab';
import AdminUserManagementTab from '../components/admin/AdminUserManagementTab';
import AdminSystemSettingsTab from '../components/admin/AdminSystemSettingsTab';

type AdminView = 'Academic Structure' | 'User Management' | 'System Settings';

interface AdminPanelProps {
  view: AdminView;
}

const viewTitles: Record<AdminView, string> = {
  'Academic Structure': 'Academic Structure',
  'User Management': 'User Management',
  'System Settings': 'System Settings',
};

const AdminPanel: React.FC<AdminPanelProps> = ({ view }) => {
  const renderContent = () => {
    switch (view) {
      case 'Academic Structure':
        return <AdminAcademicStructureTab />;
      case 'User Management':
        return <AdminUserManagementTab />;
      case 'System Settings':
        return <AdminSystemSettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{viewTitles[view]}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPanel;
