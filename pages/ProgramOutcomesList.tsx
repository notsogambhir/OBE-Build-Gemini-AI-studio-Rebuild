import React, { useState, useMemo } from 'react';
import { ProgramOutcome } from '../types';
import ExcelUploader from '../components/ExcelUploader';
import { useAppContext } from '../hooks/useAppContext';
import POAttainmentDashboard from '../components/POAttainmentDashboard';
import { Trash2 } from '../components/Icons';

const ProgramOutcomesList: React.FC = () => {
  const { selectedProgram, data, setData } = useAppContext();

  // State for the new PO creation form
  const [newPoNumber, setNewPoNumber] = useState('');
  const [newPoDescription, setNewPoDescription] = useState('');

  // DERIVE state from context, don't copy it. This is the main fix.
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
    
    // FIX: Update global state
    setData(prev => ({
        ...prev,
        programOutcomes: [...prev.programOutcomes, ...newPOs]
    }));
    alert(`${newPOs.length} POs uploaded successfully!`);
  };
  
  const handleAddPo = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPoNumber.trim() || !newPoDescription.trim() || !selectedProgram) {
          alert("Please fill in both PO Number and Description.");
          return;
      }
      const newPO: ProgramOutcome = {
          id: `po_manual_${Date.now()}`,
          programId: selectedProgram.id,
          number: newPoNumber.trim(),
          description: newPoDescription.trim()
      };
      
      // FIX: Update global state
      setData(prev => ({
          ...prev,
          programOutcomes: [...prev.programOutcomes, newPO]
      }));
      
      // Reset form
      setNewPoNumber('');
      setNewPoDescription('');
  }
  
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Program Outcomes (POs)</h1>
      </div>

      {/* New "Create PO" Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Create PO</h2>
          <ExcelUploader<{ number: string; description: string }>
              onFileUpload={handleExcelUpload}
              label="Upload POs from Excel"
              format="columns: number, description"
          />
        </div>
        <form onSubmit={handleAddPo} className="flex flex-wrap gap-4 items-end">
            <div className="flex-grow min-w-[120px]">
                <label className="block text-sm font-medium text-gray-700">PO Number</label>
                <input 
                    type="text"
                    placeholder="e.g. PO1"
                    value={newPoNumber}
                    onChange={(e) => setNewPoNumber(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                />
            </div>
            <div className="flex-grow-[3] min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700">PO Description</label>
                <input 
                    type="text"
                    placeholder="Description of the Program Outcome"
                    value={newPoDescription}
                    onChange={(e) => setNewPoDescription(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                />
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                Add PO
            </button>
        </form>
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
        </ul>
      </div>
      
      <POAttainmentDashboard programOutcomes={programOutcomes} />

    </div>
  );
};

export default ProgramOutcomesList;