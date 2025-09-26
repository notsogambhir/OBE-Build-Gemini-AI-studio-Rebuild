
import React, { useState } from 'react';
import { Course } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import AssessmentDetails from './AssessmentDetails';

interface ManageCourseAssessmentsProps {
  course: Course;
}

const ManageCourseAssessments: React.FC<ManageCourseAssessmentsProps> = ({ course }) => {
  const { data, currentUser } = useAppContext();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  const assessments = data.assessments.filter(a => a.courseId === course.id);
  const isCoordinator = currentUser?.role === 'Program Co-ordinator';

  if (selectedAssessmentId) {
    return <AssessmentDetails assessmentId={selectedAssessmentId} onBack={() => setSelectedAssessmentId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Course Assessments</h2>
        {isCoordinator && (
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
            Create Assessment
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {assessments.map(assessment => {
          const totalMaxMarks = assessment.questions.reduce((sum, q) => sum + q.maxMarks, 0);
          return (
            <div key={assessment.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
              <div>
                <p className="font-semibold text-gray-800">{assessment.name}</p>
                <p className="text-sm text-gray-500">{assessment.type} | Max Marks: {totalMaxMarks}</p>
              </div>
              <div className="space-x-4">
                <button 
                  onClick={() => setSelectedAssessmentId(assessment.id)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Manage Questions
                </button>
                {isCoordinator && (
                   <button className="text-red-600 hover:text-red-800 font-semibold">
                      Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default ManageCourseAssessments;