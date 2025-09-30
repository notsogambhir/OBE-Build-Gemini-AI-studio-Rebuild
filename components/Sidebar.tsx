import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import {
    PieChart, BookOpen, Users, Target, Settings, ArrowLeft
} from './Icons';
import { Program } from '../types';

const getProgramDuration = (programName: string): number => {
    const lowerCaseName = programName.toLowerCase();
    if (lowerCaseName.includes('be') || lowerCaseName.includes('b. pharma')) return 4;
    if (lowerCaseName.includes('mba') || lowerCaseName.includes('m. pharma')) return 2;
    return 4; // Default
};


const Sidebar: React.FC = () => {
  const { currentUser, data, selectedProgram, selectedBatch, setProgramAndBatch, goBackToProgramSelection } = useAppContext();
  const navigate = useNavigate();

  const isHighLevelUser = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'University');
  
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(selectedProgram?.collegeId || '');

  const programsForSelectedCollege = useMemo(() => {
    if (!selectedCollegeId) return [];
    return data.programs.filter(p => p.collegeId === selectedCollegeId);
  }, [data.programs, selectedCollegeId]);

  const batchYears = useMemo(() => {
    if (!selectedProgram) return [];
    const duration = getProgramDuration(selectedProgram.name);
    const startYears = Array.from({length: 8}, (_, i) => new Date().getFullYear() - i);
    return startYears.map(startYear => `${startYear}-${startYear + duration}`);
  }, [selectedProgram]);

  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCollegeId = e.target.value;
    setSelectedCollegeId(newCollegeId);
    goBackToProgramSelection(); 
  };

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProgramId = e.target.value;
    if (!newProgramId) {
        goBackToProgramSelection();
        return;
    }
    const program = data.programs.find(p => p.id === newProgramId);
    if (program) {
        const duration = getProgramDuration(program.name);
        const defaultBatch = `${new Date().getFullYear()}-${new Date().getFullYear() + duration}`;
        setSelectedCollegeId(program.collegeId); // Keep college dropdown in sync
        setProgramAndBatch(program, defaultBatch);
    }
  };

  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedProgram) {
        setProgramAndBatch(selectedProgram, e.target.value);
    }
  };

  const allMenuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <PieChart />, roles: ['Teacher', 'Program Co-ordinator', 'University', 'Admin'] },
    { to: '/department/students', label: 'Student Management', icon: <Users />, roles: ['Department'] },
    { to: '/department/faculty', label: 'Faculty Management', icon: <Users />, roles: ['Department'] },
    { to: '/courses', label: 'Courses', icon: <BookOpen />, roles: ['Teacher', 'Program Co-ordinator', 'Admin'] },
    { to: '/students', label: 'Students', icon: <Users />, roles: ['Teacher', 'Program Co-ordinator', 'Admin'] },
    { to: '/teachers', label: 'Teachers', icon: <Users />, roles: ['Program Co-ordinator'] },
    { to: '/program-outcomes', label: 'Program Outcomes', icon: <Target />, roles: ['Program Co-ordinator', 'Admin'] },
    { to: '/reports', label: 'Attainment Reports', icon: <PieChart />, roles: ['Teacher', 'Program Co-ordinator', 'University', 'Admin'] },
    { to: '/user-management', label: 'User Management', icon: <Users />, roles: ['Admin'] },
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

        {isHighLevelUser && (
            <div className="p-4 space-y-4 border-b">
                <div>
                    <label htmlFor="college-select" className="block text-sm font-medium text-gray-700">College</label>
                    <select id="college-select" value={selectedCollegeId} onChange={handleCollegeChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="">-- Select College --</option>
                        {data.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="program-select" className="block text-sm font-medium text-gray-700">Program</label>
                    <select id="program-select" value={selectedProgram?.id || ''} onChange={handleProgramChange} disabled={!selectedCollegeId} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100">
                        <option value="">-- Select Program --</option>
                        {programsForSelectedCollege.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="batch-select" className="block text-sm font-medium text-gray-700">Batch</label>
                    <select id="batch-select" value={selectedBatch || ''} onChange={handleBatchChange} disabled={!selectedProgram} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100">
                        <option value="">-- Select Batch --</option>
                        {batchYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
            </div>
        )}

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