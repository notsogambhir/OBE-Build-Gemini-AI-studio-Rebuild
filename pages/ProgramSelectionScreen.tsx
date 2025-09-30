import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Program } from '../types';
import BatchSelectionModal from '../components/BatchSelectionModal';
import { GraduationCap, LogOut } from '../components/Icons';

const ProgramSelectionScreen: React.FC = () => {
    const { data, currentUser, selectedLoginCollege, logout } = useAppContext();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProgramForBatch, setSelectedProgramForBatch] = useState<Program | null>(null);

    const programs = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'Admin' || currentUser.role === 'University') {
            return data.programs;
        }
        if (currentUser.role === 'Program Co-ordinator') {
            if (currentUser.programId) {
                return data.programs.filter(p => p.id === currentUser.programId);
            }
            return [];
        }
        return data.programs.filter(p => p.collegeId === selectedLoginCollege);
    }, [data.programs, currentUser, selectedLoginCollege]);
    
    const handleProgramSelect = (program: Program) => {
        setSelectedProgramForBatch(program);
        setIsModalOpen(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const collegeName = data.colleges.find(c => c.id === selectedLoginCollege)?.name || 'All Colleges';

    return (
        <div className="h-full bg-gray-100 p-8 flex flex-col">
            <header className="flex items-center justify-between mb-8 flex-shrink-0">
                <div className="flex items-center gap-4">
                   <img src="https://d1hbpr09pwz0sk.cloudfront.net/logo_url/chitkara-university-4c35e411" alt="Logo" className="h-12" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Select a Program</h1>
                        {currentUser && <p className="text-gray-600">
                           Welcome, {currentUser.name} ({currentUser.role}) | College: <strong>{collegeName}</strong>
                        </p>}
                    </div>
                </div>
                <button 
                    onClick={handleLogout} 
                    className="flex items-center px-4 py-2 font-medium text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                </button>
            </header>
            <div className="flex-grow overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {programs.map(program => (
                        <button 
                            key={program.id}
                            onClick={() => handleProgramSelect(program)}
                            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
                        >
                            <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4">
                                <GraduationCap className="w-8 h-8"/>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{program.name}</h3>
                            <p className="text-sm text-gray-500">{data.colleges.find(c => c.id === program.collegeId)?.name}</p>
                        </button>
                    ))}
                </div>
            </div>
            {isModalOpen && selectedProgramForBatch && (
                <BatchSelectionModal 
                    program={selectedProgramForBatch}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ProgramSelectionScreen;