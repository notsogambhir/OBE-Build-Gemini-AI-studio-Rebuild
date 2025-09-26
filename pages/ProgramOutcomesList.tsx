



import React, { useState } from 'react';
import { ProgramOutcome } from '../types';
// FIX: Use context instead of non-existent MOCK data.
import ExcelUploader from '../components/ExcelUploader';
import { useAppContext } from '../hooks/useAppContext';
import POAttainmentDashboard from '../components/POAttainmentDashboard';

const ProgramOutcomesList: React.FC = () => {
  const { selectedProgram, data } = useAppContext();
  const [programOutcomes, setProgramOutcomes] = useState<ProgramOutcome[]>(
    // FIX: Get POs from context data.
    data.programOutcomes.filter(po => po.programId === selectedProgram?.id)
  );

  const handleExcelUpload = (data: { code: string; description: string }[]) => {
    const newPOs: ProgramOutcome[] = data.map((row, i) => ({
      id: `po_excel_${Date.now()}_${i}`,
      programId: selectedProgram!.id,
      // FIX: Use 'number' property instead of 'code' to match ProgramOutcome type.
      number: row.code,
      description: row.description
    }));
    setProgramOutcomes(prev => [...prev, ...newPOs]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Program Outcomes (POs)</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
          Add New PO
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Batch Create POs</h2>
        <div className="flex justify-center">
            {/* FIX: Generic type argument is now valid. */}
            <ExcelUploader<{ code: string; description: string }>
                onFileUpload={handleExcelUpload}
                label="Upload POs from Excel"
                format="columns: code, description"
            />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Current POs</h2>
         <ul className="space-y-3">
            {programOutcomes.map(po => (
                <li key={po.id} className="p-4 bg-gray-100 rounded-lg">
                    {/* FIX: Use 'po.number' instead of 'po.code'. */}
                    <span className="font-bold text-gray-800">{po.number}:</span>
                    <span className="ml-2 text-gray-600">{po.description}</span>
                </li>
            ))}
        </ul>
      </div>
      
      <POAttainmentDashboard programOutcomes={programOutcomes} />

    </div>
  );
};

export default ProgramOutcomesList;