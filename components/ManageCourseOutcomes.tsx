

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CourseOutcome } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import ExcelUploader from './ExcelUploader';

const ManageCourseOutcomes: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, setData, currentUser } = useAppContext();

  // Get course outcomes from global state
  const outcomes = useMemo(
    () => data.courseOutcomes.filter(co => co.courseId === courseId),
    [data.courseOutcomes, courseId]
  );

  // Auto-generate the next CO number
  const nextCoNumber = useMemo(() => {
    const highestNum = outcomes.reduce((max, co) => {
      const num = parseInt(co.number.replace('CO', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    return `CO${highestNum + 1}`;
  }, [outcomes]);

  // State for the new CO form
  const [newCoNumber, setNewCoNumber] = useState(nextCoNumber);
  const [newCoDescription, setNewCoDescription] = useState('');

  // Update the auto-generated number if the outcomes list changes
  useEffect(() => {
    setNewCoNumber(nextCoNumber);
  }, [nextCoNumber]);

  // State for inline editing
  const [editingCoId, setEditingCoId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState({ number: '', description: '' });

  // Permissions
  const canManage = currentUser?.role === 'Teacher' || currentUser?.role === 'Program Co-ordinator';


  const handleExcelUpload = (uploadedData: { code: string; description: string }[]) => {
    if (!courseId) return;
    const newOutcomes: CourseOutcome[] = uploadedData
      .filter(row => row.code && row.description)
      .map((row, i) => ({
        id: `co_excel_${Date.now()}_${i}`,
        courseId: courseId,
        number: row.code,
        description: row.description
      }));
    
    setData(prev => ({
        ...prev,
        courseOutcomes: [...prev.courseOutcomes, ...newOutcomes]
    }));
    alert(`${newOutcomes.length} COs uploaded successfully!`);
  };

  const handleAddCo = () => {
    if (!newCoDescription.trim() || !courseId) {
        alert("Please fill in the Description.");
        return;
    }
    const newCo: CourseOutcome = {
        id: `co_manual_${Date.now()}`,
        courseId,
        number: newCoNumber.trim(),
        description: newCoDescription.trim()
    };

    setData(prev => ({
        ...prev,
        courseOutcomes: [...prev.courseOutcomes, newCo]
    }));

    // Reset form
    setNewCoDescription('');
  };
  
  const handleDeleteCo = (coId: string) => {
    if (window.confirm("Are you sure you want to delete this Course Outcome?")) {
        setData(prev => ({
            ...prev,
            courseOutcomes: prev.courseOutcomes.filter(co => co.id !== coId)
        }));
    }
  };

  const handleEditStart = (co: CourseOutcome) => {
    setEditingCoId(co.id);
    setEditingText({ number: co.number, description: co.description });
  };
  
  const handleEditCancel = () => {
    setEditingCoId(null);
    setEditingText({ number: '', description: '' });
  };
  
  const handleEditSave = () => {
    if (!editingCoId || !editingText.number.trim() || !editingText.description.trim()) return;

    setData(prev => ({
        ...prev,
        courseOutcomes: prev.courseOutcomes.map(co =>
            co.id === editingCoId
                ? { ...co, number: editingText.number.trim(), description: editingText.description.trim() }
                : co
        )
    }));
    
    handleEditCancel(); // Reset editing state
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Manage Course Outcomes (COs)</h2>
        {canManage && (
            <ExcelUploader<{ code: string; description: string }>
              onFileUpload={handleExcelUpload}
              label="Upload COs"
              format="columns: code, description"
            />
        )}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">CO Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {outcomes.map(co => (
              <tr key={co.id}>
                {editingCoId === co.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editingText.number}
                        onChange={(e) => setEditingText({ ...editingText, number: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editingText.description}
                        onChange={(e) => setEditingText({ ...editingText, description: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={handleEditSave} className="text-green-600 hover:text-green-800 mr-4">Save</button>
                      <button onClick={handleEditCancel} className="text-gray-600 hover:text-gray-800">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{co.number}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-600">{co.description}</td>
                    {canManage && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEditStart(co)} className="text-indigo-600 hover:text-indigo-800 mr-4">Edit</button>
                          <button onClick={() => handleDeleteCo(co.id)} className="text-red-600 hover:text-red-800">Delete</button>
                        </td>
                    )}
                  </>
                )}
              </tr>
            ))}
            {canManage && editingCoId === null && (
                <tr className="bg-gray-50/50">
                    <td className="px-6 py-4">
                        <input
                            type="text"
                            value={newCoNumber}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0 focus:border-gray-300"
                        />
                    </td>
                    <td className="px-6 py-4">
                         <input
                            type="text"
                            placeholder="Description Input"
                            value={newCoDescription}
                            onChange={(e) => setNewCoDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </td>
                    <td className="px-6 py-4 text-right">
                         <button onClick={handleAddCo} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                            Add
                        </button>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCourseOutcomes;