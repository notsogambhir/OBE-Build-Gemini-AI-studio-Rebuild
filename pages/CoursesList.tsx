import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Course } from '../types';
import ExcelUploader from '../components/ExcelUploader';
import AddCourseModal from '../components/AddCourseModal';

const CoursesList: React.FC = () => {
  const { selectedProgram, data, setData } = useAppContext();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);

  const programCourses = useMemo(
    () => data.courses.filter((c) => c.programId === selectedProgram?.id),
    [data.courses, selectedProgram]
  );
  
  const handleExcelUpload = (uploadedData: { code: string; name: string }[]) => {
    if (!selectedProgram) return;

    const newCourses: Course[] = uploadedData.map((row, index) => ({
      id: `c_excel_${Date.now()}_${index}`,
      code: row.code || 'N/A',
      name: row.name || 'Untitled Course',
      programId: selectedProgram.id,
      target: 60,
      internalWeightage: 40,
      externalWeightage: 60,
      attainmentLevels: { level3: 80, level2: 70, level1: 60 }
    }));
    
    setData(prev => ({
        ...prev,
        courses: [...prev.courses, ...newCourses]
    }));
  };

  const handleAddCourse = (newCourse: Course) => {
      setData(prev => ({
          ...prev,
          courses: [...prev.courses, newCourse]
      }));
      setModalOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
        <button onClick={() => setModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Add New Course
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Batch Create Courses</h2>
        <ExcelUploader<{ code: string; name: string }>
          onFileUpload={handleExcelUpload}
          label="Upload Excel"
          format="columns: code, name"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {programCourses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{course.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => navigate(`/courses/${course.id}`)} className="text-indigo-600 hover:text-indigo-800">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {isModalOpen && selectedProgram && (
          <AddCourseModal 
            onAdd={handleAddCourse} 
            onClose={() => setModalOpen(false)}
            programId={selectedProgram.id}
          />
        )}
    </div>
  );
};

export default CoursesList;