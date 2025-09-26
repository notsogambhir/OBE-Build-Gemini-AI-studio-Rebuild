import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Student, StudentStatus } from '../types';
import ExcelUploader from '../components/ExcelUploader';

const StudentsList: React.FC = () => {
  const { selectedProgram, data, setData } = useAppContext();
  
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentName, setNewStudentName] = useState('');

  const programStudents = useMemo(
    () => data.students.filter(s => s.programId === selectedProgram?.id),
    [data.students, selectedProgram]
  );

  const handleStatusChange = (studentId: string, newStatus: StudentStatus) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === studentId ? { ...s, status: newStatus } : s)
    }));
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId.trim() || !newStudentName.trim() || !selectedProgram) {
      alert("Please provide both a Student ID and Name.");
      return;
    }
    
    if (data.students.some(s => s.id.toLowerCase() === newStudentId.trim().toLowerCase())) {
        alert("A student with this ID already exists.");
        return;
    }

    const newStudent: Student = {
      id: newStudentId.trim(),
      name: newStudentName.trim(),
      programId: selectedProgram.id,
      status: 'Active' // New students default to Active
    };

    setData(prev => ({
      ...prev,
      students: [...prev.students, newStudent]
    }));

    setNewStudentId('');
    setNewStudentName('');
  };

  const handleExcelUpload = (uploadedData: { id: string; name: string }[]) => {
    if (!selectedProgram) return;

    const existingStudentIds = new Set(data.students.map(s => s.id.toLowerCase()));
    
    const newStudents: Student[] = uploadedData
      .filter(row => row.id && row.name && !existingStudentIds.has(String(row.id).toLowerCase()))
      .map(row => ({
        id: String(row.id),
        name: String(row.name),
        programId: selectedProgram.id,
        status: 'Active'
      }));

    setData(prev => ({
        ...prev,
        students: [...prev.students, ...newStudents]
    }));
    
    alert(`${newStudents.length} new students were added.`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
      <p className="text-gray-500">Manage students for the {selectedProgram?.name} program.</p>
      
      {/* Add / Upload Students */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Add Students</h2>
             <ExcelUploader<{ id: string; name: string }>
              onFileUpload={handleExcelUpload}
              label="Upload Excel"
              format="columns: id, name"
            />
        </div>
        <form onSubmit={handleAddStudent} className="flex flex-wrap gap-4 items-end">
            <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                <input 
                    type="text" 
                    value={newStudentId} 
                    onChange={e => setNewStudentId(e.target.value)} 
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    required
                />
            </div>
             <div className="flex-grow-[2]">
                <label className="block text-sm font-medium text-gray-700">Student Name</label>
                <input 
                    type="text" 
                    value={newStudentName} 
                    onChange={e => setNewStudentName(e.target.value)} 
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    required
                />
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Add Student</button>
        </form>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {programStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <select
                      value={student.status}
                      onChange={(e) => handleStatusChange(student.id, e.target.value as StudentStatus)}
                      className={`p-1 border rounded-md bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 ${student.status === 'Active' ? 'border-green-300' : 'border-red-300'}`}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsList;