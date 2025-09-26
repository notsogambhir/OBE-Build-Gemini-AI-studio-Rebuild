





import React, { useState, useMemo } from 'react';
// FIX: Import CoPoMapping type as the component will now accept it as a prop.
import { CourseOutcome, ProgramOutcome, CoPoMap, CoPoMapping } from '../types';

interface CoPoMappingMatrixProps {
  courseOutcomes: CourseOutcome[];
  programOutcomes: ProgramOutcome[];
  // FIX: Change prop to accept an array of mappings, which is how it's stored in context.
  initialMap: CoPoMapping[];
}

const CoPoMappingMatrix: React.FC<CoPoMappingMatrixProps> = ({ courseOutcomes, programOutcomes, initialMap: initialMapArray }) => {
  
  // FIX: Process the initialMapArray into the CoPoMap object format used by the component's state.
  const initialMap = useMemo(() => {
    const map: CoPoMap = {};
    for (const co of courseOutcomes) {
      map[co.id] = {};
    }
    for (const mapping of initialMapArray) {
      if (map[mapping.coId]) {
        map[mapping.coId][mapping.poId] = mapping.level;
      }
    }
    return map;
  }, [initialMapArray, courseOutcomes]);

  const [mapping, setMapping] = useState<CoPoMap>(initialMap);

  const handleMappingChange = (coId: string, poId: string, value: string) => {
    const level = parseInt(value, 10);
    if (isNaN(level) || level < 0 || level > 3) return;
    
    setMapping(prev => ({
      ...prev,
      [coId]: {
        ...prev[coId],
        [poId]: level
      }
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">CO-PO Mapping Matrix</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 p-2 text-xs font-medium text-gray-500 uppercase">CO</th>
              {programOutcomes.map(po => (
                <th key={po.id} className="border border-gray-300 p-2 text-xs font-medium text-gray-500 uppercase" title={po.description}>
                  {/* FIX: Use 'po.number' instead of 'po.code'. */}
                  {po.number}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courseOutcomes.map(co => (
              <tr key={co.id} className="bg-white hover:bg-gray-50">
                <td className="border border-gray-300 p-2 text-sm font-medium text-gray-900" title={co.description}>
                  {/* FIX: Use 'co.number' instead of 'co.code'. */}
                  {co.number}
                </td>
                {programOutcomes.map(po => (
                  <td key={po.id} className="border border-gray-300 p-1">
                    <select
                      value={mapping[co.id]?.[po.id] || 0}
                      onChange={(e) => handleMappingChange(co.id, po.id, e.target.value)}
                      className="w-full bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="0">-</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <button className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
          Save Mapping
        </button>
    </div>
  );
};

export default CoPoMappingMatrix;