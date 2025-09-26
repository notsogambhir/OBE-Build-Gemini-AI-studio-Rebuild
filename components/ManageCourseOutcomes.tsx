



import React, { useState } from 'react';
import { Course, CourseOutcome } from '../types';
import ExcelUploader from './ExcelUploader';

interface ManageCourseOutcomesProps {
  course: Course;
  outcomes: CourseOutcome[];
}

const ManageCourseOutcomes: React.FC<ManageCourseOutcomesProps> = ({ course, outcomes: initialOutcomes }) => {
  const [outcomes, setOutcomes] = useState<CourseOutcome[]>(initialOutcomes);

  const handleExcelUpload = (data: { code: string; description: string }[]) => {
    const newOutcomes: CourseOutcome[] = data.map((row, i) => ({
      id: `co_excel_${Date.now()}_${i}`,
      courseId: course.id,
      // FIX: Use 'number' instead of 'code' to match CourseOutcome type.
      number: row.code,
      description: row.description
    }));
    setOutcomes(prev => [...prev, ...newOutcomes]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Manage Course Outcomes (COs)</h2>
        {/* FIX: Generic type argument is now valid after updating ExcelUploader. */}
        <ExcelUploader<{ code: string; description: string }>
          onFileUpload={handleExcelUpload}
          label="Upload COs"
          format="columns: code, description"
        />
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CO Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {outcomes.map(co => (
              <tr key={co.id} className="hover:bg-gray-50">
                {/* FIX: Use 'co.number' instead of 'co.code'. */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{co.number}</td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-600">{co.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-800 mr-4">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCourseOutcomes;