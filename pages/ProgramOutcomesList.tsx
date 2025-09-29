import React, { useState, useMemo } from 'react';
import { ProgramOutcome } from '../types';
import ExcelUploader from '../components/ExcelUploader';
import { useAppContext } from '../hooks/useAppContext';
import POAttainmentDashboard from '../components/POAttainmentDashboard';
import { Trash2 } from '../components/Icons';
import AddProgramOutcomeModal from '../components/AddProgramOutcomeModal';

const ProgramOutcomesList: React.FC = () => {
  const { selectedProgram, data, setData } = useAppContext();
  const [isModalOpen, setModalOpen] = useState(false);
  
  const programOutcomes = useMemo(() =>
    data.programOutcomes.filter(po => po.programId === selectedProgram?.id)
  , [data.programOutcomes, selectedProgram?.id]);

  const handleExcelUpload = (uploadedData: { number: string; description: string }[]) => {
    if (!selectedProgram) return;

    const newPOs: ProgramOutcome[] = uploadedData
      .filter(row => row.number && row.description)
      .map((row, i) => ({
        id: `po_excel_${Date.now()}_${i}`,
        programId: selectedProgram.id,
        number: row.number,
        description: row.description
    }));
    
    setData(prev => ({
        ...prev,
        programOutcomes: [...prev.programOutcomes, ...newPOs]
    }));
    alert(`${newPOs.length} POs uploaded successfully!`);
  };
  
  const handleDeletePo = (poId: string) => {
    if (window.confirm("Are you sure you want to delete this Program Outcome?")) {
        setData(prev => ({
            ...prev,
            programOutcomes: prev.programOutcomes.filter(po => po.id !== poId)
        }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-gray-800">Program Outcomes (POs)</h1>
        <div className="flex items-start gap-4">
            <ExcelUploader<{ number: string; description: string }>
                onFileUpload={handleExcelUpload}
                label="Upload POs"
                format="columns: number, description"
            />
            <button onClick={() => setModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                Add New PO
            </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Current POs</h2>
         <ul className="space-y-3">
            {programOutcomes.map(po => (
                <li key={po.id} className="p-4 bg-gray-100 rounded-lg flex justify-between items-center">
                    <div>
                        <span className="font-bold text-gray-800">{po.number}:</span>
                        <span className="ml-2 text-gray-600">{po.description}</span>
                    </div>
                    <button onClick={() => handleDeletePo(po.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </li>
            ))}
            {programOutcomes.length === 0 && <p className="text-gray-500 text-center py-4">No Program Outcomes defined for this program yet.</p>}
        </ul>
      </div>
      
      <POAttainmentDashboard programOutcomes={programOutcomes} />
      
      {isModalOpen && (
        <AddProgramOutcomeModal onClose={() => setModalOpen(false)} />
      )}

    </div>
  );
};

export default ProgramOutcomesList;