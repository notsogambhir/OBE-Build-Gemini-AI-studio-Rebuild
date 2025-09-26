
import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CoPoMapping, CoPoMap } from '../types';
import { useAppContext } from '../hooks/useAppContext';


const CoPoMappingMatrix: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, setData, currentUser } = useAppContext();
  
  const canManage = currentUser?.role === 'Teacher' || currentUser?.role === 'Program Co-ordinator';

  // Fetch all required data from context
  const { courseOutcomes, programOutcomes, initialMapArray } = useMemo(() => {
    const course = data.courses.find(c => c.id === courseId);
    return {
      courseOutcomes: data.courseOutcomes.filter(co => co.courseId === courseId),
      programOutcomes: data.programOutcomes.filter(po => po.programId === course?.programId),
      initialMapArray: data.coPoMapping.filter(m => m.courseId === courseId),
    };
  }, [courseId, data]);
  
  // State to hold the current mapping being edited
  const [mapping, setMapping] = useState<CoPoMap>({});

  // Effect to initialize or reset state when data changes
  useEffect(() => {
    const map: CoPoMap = {};
    for (const co of courseOutcomes) {
      map[co.id] = {};
    }
    for (const m of initialMapArray) {
      if (map[m.coId]) {
        map[m.coId][m.poId] = m.level;
      }
    }
    setMapping(map);
  }, [courseOutcomes, initialMapArray]);

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

  const handleSaveMapping = () => {
    if (!courseId) return;
    
    // Convert the state object back into the array format for global state
    const newMappingArray: CoPoMapping[] = [];
    Object.keys(mapping).forEach(coId => {
      Object.keys(mapping[coId]).forEach(poId => {
        const level = mapping[coId][poId];
        if (level > 0) { // Only save meaningful mappings
          newMappingArray.push({
            courseId,
            coId,
            poId,
            level
          });
        }
      });
    });

    // Update the global state
    setData(prev => ({
      ...prev,
      // Remove old mappings for this course and add the new ones
      coPoMapping: [
        ...prev.coPoMapping.filter(m => m.courseId !== courseId),
        ...newMappingArray
      ]
    }));
    
    alert("Mapping saved successfully!");
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
                  {po.number}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courseOutcomes.map(co => (
              <tr key={co.id} className="bg-white hover:bg-gray-50">
                <td className="border border-gray-300 p-2 text-sm font-medium text-gray-900" title={co.description}>
                  {co.number}
                </td>
                {programOutcomes.map(po => (
                  <td key={po.id} className="border border-gray-300 p-1">
                    <select
                      value={mapping[co.id]?.[po.id] || 0}
                      onChange={(e) => handleMappingChange(co.id, po.id, e.target.value)}
                      className="w-full bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      disabled={!canManage}
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
      {canManage && (
       <button 
          onClick={handleSaveMapping}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Save Mapping
        </button>
      )}
    </div>
  );
};

export default CoPoMappingMatrix;