import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { LogOut, Grid } from './Icons';

const Header: React.FC = () => {
    const { currentUser, selectedProgram, selectedBatch, logout, goBackToProgramSelection } = useAppContext();
    return (
        <header className="bg-white shadow-sm p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{selectedProgram?.name}</h1>
                    <p className="mt-1 text-gray-500">Batch {selectedBatch}</p>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-semibold text-gray-700">{currentUser?.name}</p>
                        <p className="text-sm text-gray-500">{currentUser?.role}</p>
                    </div>
                    <button 
                        onClick={goBackToProgramSelection}
                        title="Program Selection"
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        <Grid className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={logout} 
                        title="Logout"
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