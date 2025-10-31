import React from 'react';
<<<<<<< HEAD
// FIX: Changed react-router-dom import to namespace import to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom'; // A tool for programmatically changing the page.
import { useAppContext } from '../hooks/useAppContext'; // Helper to get shared data.
import { LogOut, Grid } from './Icons'; // Imports the logout and grid icon images.
=======
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { LogOut, Grid } from './Icons';
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)

const Header: React.FC = () => {
    const { currentUser, selectedProgram, selectedBatch, logout, goBackToProgramSelection } = useAppContext();
<<<<<<< HEAD
    
    // `useNavigate` gives us a function (`navigate`) to tell the app to go to a different URL.
    const navigate = ReactRouterDOM.useNavigate();
=======
    const navigate = useNavigate();
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGoToSelection = () => {
        goBackToProgramSelection();
        navigate('/program-selection');
    };

    return (
        <header className="bg-white shadow-sm p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{selectedProgram?.name || currentUser?.name}</h1>
                    <p className="mt-1 text-gray-500">
                        {selectedBatch ? `Batch ${selectedBatch}` : (currentUser?.role || 'User')}
                    </p>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-semibold text-gray-700">{currentUser?.name}</p>
                        <p className="text-sm text-gray-500">{currentUser?.role}</p>
                        <p className="text-xs text-gray-400">{currentUser?.employeeId}</p>
                    </div>
                    { currentUser?.role !== 'Department' && (
                        <button 
                            onClick={handleGoToSelection}
                            title="Program Selection"
                            aria-label="Program Selection"
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                            <Grid className="w-6 h-6" />
                        </button>
                    )}
                    <button 
                        onClick={handleLogout} 
                        title="Logout"
                        aria-label="Logout"
                        className="p-2 rounded-full hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;