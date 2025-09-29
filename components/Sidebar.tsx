import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import {
    PieChart, BookOpen, Users, Target, Settings, ArrowLeft
} from './Icons';

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const { currentUser } = useAppContext();
  const navigate = useNavigate();

  const allMenuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <PieChart />, roles: ['Teacher', 'Program Co-ordinator', 'University', 'Admin'] },
    { to: '/courses', label: 'Courses', icon: <BookOpen />, roles: ['Teacher', 'Program Co-ordinator', 'Admin'] },
    { to: '/students', label: 'Students', icon: <Users />, roles: ['Teacher', 'Program Co-ordinator', 'Admin'] },
    { to: '/program-outcomes', label: 'Program Outcomes', icon: <Target />, roles: ['Program Co-ordinator', 'Admin'] },
    { to: '/reports', label: 'Attainment Reports', icon: <PieChart />, roles: ['Teacher', 'Program Co-ordinator', 'University', 'Admin'] },
    { to: '/settings', label: 'Settings', icon: <Settings />, roles: ['Admin'] },
  ];
  
  const menuItems = allMenuItems.filter(item => currentUser && item.roles.includes(currentUser.role));

  return (
    <aside className="w-64 bg-white shadow-md flex-col hidden sm:flex">
        <div className="flex items-center justify-center p-6 border-b">
           <button onClick={() => navigate(-1)} className="flex items-center text-gray-800 hover:text-indigo-600 transition-colors">
             <ArrowLeft className="w-5 h-5 mr-2" />
             <span className="font-semibold">Back</span>
           </button>
        </div>
      <nav className="flex-1 px-4 py-6">
        {menuItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `w-full flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                isActive 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span className="ml-4 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;