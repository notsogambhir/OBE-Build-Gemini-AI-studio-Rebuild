import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const Header: React.FC = () => {
    const { currentUser, selectedProgram, selectedBatch } = useAppContext();
    return (
        <header className="bg-white shadow-sm p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{selectedProgram?.name}</h1>
                    <p className="mt-1 text-gray-500">Batch {selectedBatch}</p>
                </div>
                 <div className="text-right">
                    <p className="font-semibold text-gray-700">{currentUser?.name}</p>
                    <p className="text-sm text-gray-500">{currentUser?.role}</p>
                </div>
            </div>
        </header>
    );
};

export default Header;