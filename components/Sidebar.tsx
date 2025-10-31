import React, { useMemo } from 'react';
<<<<<<< HEAD
// FIX: Changed react-router-dom import to namespace import to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext'; // Helper to get shared data.
// Importing all the little icon images we need for the menu items.
=======
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)
import {
    PieChart, BookOpen, Users, Target, Settings, Grid
} from './Icons';

const Sidebar: React.FC = () => {
<<<<<<< HEAD
  // We ask our "magic backpack" (AppContext) for all the data and tools we need.
  const { 
    currentUser, 
    data, 
    selectedProgram, 
    selectedBatch, 
    setProgramAndBatch, 
    goBackToProgramSelection, 
    selectedCollegeId, 
    setSelectedCollegeId 
  } = useAppContext();
  
  // `useNavigate` gives us a function to tell the app to go to a different page.
  const navigate = ReactRouterDOM.useNavigate();
=======
  // FIX: Destructure selectedCollegeId and setSelectedCollegeId from context.
  const { currentUser, data, selectedProgram, selectedBatch, setProgramAndBatch, goBackToProgramSelection, selectedCollegeId, setSelectedCollegeId } = useAppContext();
  const navigate = useNavigate();
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)

  const isHighLevelUser = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'University');
  
  // FIX: Removed local state for selectedCollegeId to use the one from global context.
  // const [selectedCollegeId, setSelectedCollegeId] = useState<string>(selectedProgram?.collegeId || '');

  const programsForSelectedCollege = useMemo(() => {
    if (!selectedCollegeId) return [];
    return data.programs.filter(p => p.collegeId === selectedCollegeId);
  }, [data.programs, selectedCollegeId]);

  const batchesForProgram = useMemo(() => {
    if (!selectedProgram) return [];
    return data.batches
        .filter(b => b.programId === selectedProgram.id)
        .sort((a, b) => b.name.localeCompare(a.name)); // Sort descending by name
  }, [data.batches, selectedProgram]);

  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCollegeId = e.target.value;
    // FIX: Use context setter to update the global state. Handle empty string value from select.
    setSelectedCollegeId(newCollegeId || null); 
    goBackToProgramSelection(); 
    navigate('/program-selection');
  };

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProgramId = e.target.value;
    if (!newProgramId) {
        goBackToProgramSelection();
        navigate('/program-selection');
        return;
    }
    const program = data.programs.find(p => p.id === newProgramId);
    if (program) {
        const programBatches = data.batches.filter(b => b.programId === program.id).sort((a,b) => b.name.localeCompare(a.name));
        const defaultBatch = programBatches.length > 0 ? programBatches[0].name : '';
        // FIX: setSelectedCollegeId is now handled inside setProgramAndBatch for consistency.
        setProgramAndBatch(program, defaultBatch);
    }
  };

  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedProgram) {
        setProgramAndBatch(selectedProgram, e.target.value);
    }
  };

  const allMenuItems = [
    // Standard Links
    { to: '/dashboard', label: 'Dashboard', icon: <PieChart />, roles: ['Teacher', 'Program Co-ordinator', 'University', 'Admin'] },
    { to: '/courses', label: 'Courses', icon: <BookOpen />, roles: ['Teacher', 'Program Co-ordinator', 'Admin'] },
    { to: '/students', label: 'Students', icon: <Users />, roles: ['Teacher', 'Program Co-ordinator', 'Admin'] },
    { to: '/teachers', label: 'Teachers', icon: <Users />, roles: ['Program Co-ordinator'] },
    { to: '/program-outcomes', label: 'Program Outcomes', icon: <Target />, roles: ['Program Co-ordinator', 'Admin'] },
    { to: '/reports', label: 'Attainment Reports', icon: <PieChart />, roles: ['Teacher', 'Program Co-ordinator', 'University', 'Admin'] },

    // Department Links
    { to: '/department/students', label: 'Student Management', icon: <Users />, roles: ['Department'] },
    { to: '/department/faculty', label: 'Faculty Management', icon: <Users />, roles: ['Department'] },
    
    // New Direct Admin Links
    { to: '/admin/academic-structure', label: 'Academic Structure', icon: <Grid />, roles: ['Admin'] },
    { to: '/admin/user-management', label: 'User Management', icon: <Users />, roles: ['Admin'] },
    { to: '/admin/system-settings', label: 'System Settings', icon: <Settings />, roles: ['Admin'] },
  ];
  
  const menuItems = allMenuItems.filter(item => currentUser && item.roles.includes(currentUser.role));

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col hidden sm:flex h-full">
        <div className="flex items-center justify-center p-6 border-b flex-shrink-0">
           <img src="https://d1hbpr09pwz0sk.cloudfront.net/logo_url/chitkara-university-4c35e411" alt="Chitkara University Logo" className="h-10" />
        </div>

        {isHighLevelUser && (
            <div className="p-4 space-y-4 border-b flex-shrink-0">
                <div>
                    <label htmlFor="college-select" className="block text-sm font-medium text-gray-700">College</label>
                    {/* FIX: Use selectedCollegeId from context and handle null case. */}
                    <select id="college-select" value={selectedCollegeId || ''} onChange={handleCollegeChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
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
                        {batchesForProgram.map(batch => <option key={batch.id} value={batch.name}>{batch.name}</option>)}
                    </select>
                </div>
            </div>
        )}

      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {menuItems.map(item => (
<<<<<<< HEAD
          // `NavLink` is a special type of link from React Router that knows if it's "active".
          <ReactRouterDOM.NavLink
            key={item.to} // A unique key for each item in the list.
            to={item.to} // The URL this link will navigate to.
            // This function changes the link's style if it's the active page.
=======
          <NavLink
            key={item.to}
            to={item.to}
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)
            className={({ isActive }) =>
              `w-full flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                isActive 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
<<<<<<< HEAD
            {item.icon} {/* The icon for the menu item */}
            <span className="ml-4 font-medium">{item.label}</span> {/* The text label */}
          </ReactRouterDOM.NavLink>
=======
            {item.icon}
            <span className="ml-4 font-medium">{item.label}</span>
          </NavLink>
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;