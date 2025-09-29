import React, { useState, useMemo } from 'react';
import { ProgramOutcome } from '../types';

interface POAttainmentDashboardProps {
  programOutcomes: ProgramOutcome[];
}

const POAttainmentDashboard: React.FC<POAttainmentDashboardProps> = ({ programOutcomes }) => {
  // Mock direct attainment values for demonstration
  const directAttainment = useMemo(() => {
    const attainment: { [poId: string]: number } = {};
    programOutcomes.forEach(po => {
      attainment[po.id] = parseFloat((Math.random() * (2.8 - 1.5) + 1.5).toFixed(2));
    });
    return attainment;
  }, [programOutcomes]);
  
  const [indirectAttainment, setIndirectAttainment] = useState<{ [poId: string]: string }>({});
  const [weights, setWeights] = useState({ direct: 90, indirect: 10 });

  const handleIndirectChange = (poId: string, value: string) => {
    setIndirectAttainment(prev => ({ ...prev, [poId]: value }));
  };
  
  const handleWeightChange = (type: 'direct' | 'indirect', value: string) => {
    const numValue = parseInt(value, 10);
    // Ignore invalid inputs to prevent weird states
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        return; 
    }

    if (type === 'direct') {
        setWeights({
            direct: numValue,
            indirect: 100 - numValue
        });
    } else { // type === 'indirect'
        setWeights({
            direct: 100 - numValue,
            indirect: numValue
        });
    }
  };

  const calculateOverall = (poId: string) => {
    const direct = directAttainment[poId] || 0;
    
    // Requirement: Default indirect attainment is 3
    const indirectValue = indirectAttainment[poId];
    const indirect = (indirectValue === undefined || indirectValue.trim() === '') 
      ? 3 
      : parseFloat(indirectValue);

    // Handle case where user enters non-numeric text
    if (isNaN(indirect)) {
        return 'Invalid';
    }

    const directWeight = weights.direct / 100;
    const indirectWeight = weights.indirect / 100;
    
    return (direct * directWeight + indirect * indirectWeight).toFixed(2);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">PO Attainment Dashboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 p-2 text-sm font-medium text-gray-500 uppercase">Attainment Type</th>
              <th className="border border-gray-300 p-2 text-sm font-medium text-gray-500 uppercase">Target</th>
              {programOutcomes.map(po => (
                <th key={po.id} className="border border-gray-300 p-2 text-sm font-medium text-gray-500 uppercase">{po.number}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border border-gray-300 p-2 font-semibold text-gray-700">Direct</td>
              <td className="border border-gray-300 p-1">
                <div className="flex items-center">
                    <input type="number" value={weights.direct} onChange={e => handleWeightChange('direct', e.target.value)} className="w-20 bg-white border border-gray-300 text-gray-900 p-1 rounded-md text-center" />
                    <span className="ml-1 text-gray-700">%</span>
                </div>
              </td>
              {programOutcomes.map(po => (
                <td key={po.id} className="border border-gray-300 p-2 text-center font-semibold text-green-600">{directAttainment[po.id]}</td>
              ))}
            </tr>
            <tr className="bg-white">
              <td className="border border-gray-300 p-2 font-semibold text-gray-700">Indirect</td>
               <td className="border border-gray-300 p-1">
                 <div className="flex items-center">
                    <input type="number" value={weights.indirect} onChange={e => handleWeightChange('indirect', e.target.value)} className="w-20 bg-white border border-gray-300 text-gray-900 p-1 rounded-md text-center" />
                    <span className="ml-1 text-gray-700">%</span>
                </div>
              </td>
              {programOutcomes.map(po => (
                <td key={po.id} className="border border-gray-300 p-1">
                  <input
                    type="number"
                    step="0.1"
                    className="w-20 bg-white border border-gray-300 text-gray-900 p-1 rounded-md text-center"
                    placeholder="3"
                    value={indirectAttainment[po.id] ?? ''}
                    onChange={(e) => handleIndirectChange(po.id, e.target.value)}
                  />
                </td>
              ))}
            </tr>
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-300 p-2 text-gray-800">Overall Attainment</td>
              <td className="border border-gray-300 p-2 text-center text-gray-800">100%</td>
              {programOutcomes.map(po => (
                <td key={po.id} className="border border-gray-300 p-2 text-center text-xl text-yellow-600">
                  {calculateOverall(po.id)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default POAttainmentDashboard;