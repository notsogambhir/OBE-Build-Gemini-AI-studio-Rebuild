

import React, { useState } from 'react';
import { Course } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import AssessmentDetails from './AssessmentDetails';
import CreateAssessmentModal from './CreateAssessmentModal';

interface ManageCourseAssessmentsProps {
  course: Course;
}

const ManageCourseAssessments: React.FC<ManageCourseAssessmentsProps> = ({ course }) => {
  const { data, setData, currentUser } = useAppContext();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const assessments = data.assessments.filter(a => a.courseId === course.id);
  const isCoordinator = currentUser?.role === 'Program Co-ordinator';

  const handleDeleteAssessment = (assessmentId: string) => {
    if (window.confirm("Are you sure you want to delete this assessment and all its questions and marks? This action cannot be undone.")) {
      setData(prev => ({
        ...prev,
        assessments: prev.assessments.filter(a => a.id !== assessmentId),
        marks: prev.marks.filter(m => m.assessmentId !== assessmentId)
      }));
    }
  }

  if (selectedAssessmentId) {
    return <AssessmentDetails assessmentId={selectedAssessmentId} onBack={() => setSelectedAssessmentId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Course Assessments</h2>
        {isCoordinator && (
          <button onClick={() => setCreateModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
            Create Assessment
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {assessments.map(assessment => {
          const totalMaxMarks = assessment.questions.reduce((sum, q) => sum + q.maxMarks, 0);
          const hasMarks = data.marks.some(m => m.assessmentId === assessment.id);
          return (
            <div key={assessment.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
              <div>
                <p className="font-semibold text-gray-800 flex items-center">
                  {assessment.name}
                  {hasMarks && (
                    <span className="ml-2 text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      ✓ Marks Uploaded
                    </span>
                  )}
                </p>
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
                   <button onClick={() => handleDeleteAssessment(assessment.id)} className="text-red-600 hover:text-red-800 font-semibold">
                      Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {assessments.length === 0 && <p className="text-gray-500 text-center py-4">No assessments found for this course.</p>}
      </div>
      {isCreateModalOpen && (
        <CreateAssessmentModal courseId={course.id} onClose={() => setCreateModalOpen(false)} />
      )}
    </div>
  );
};

export default ManageCourseAssessments;