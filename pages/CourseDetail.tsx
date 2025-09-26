import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import ManageCourseOutcomes from '../components/ManageCourseOutcomes';
import ManageCourseAssessments from '../components/ManageCourseAssessments';
import CoPoMappingMatrix from '../components/CoPoMappingMatrix';
import CourseOverviewTab from '../components/CourseOverviewTab';
import { Course } from '../types';

type Tab = 'Overview' | 'COs' | 'Assessments' | 'CO-PO Mapping';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const course = useMemo(() => data.courses.find(c => c.id === courseId), [courseId, data.courses]);
  
  if (!course) {
    return <div className="text-center text-red-500 p-8">Course not found.</div>;
  }

  const tabs: Tab[] = ['Overview', 'COs', 'Assessments', 'CO-PO Mapping'];

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <CourseOverviewTab course={course} />;
      case 'COs':
        return <ManageCourseOutcomes />;
      case 'Assessments':
        // FIX: Passed the `course` prop to `ManageCourseAssessments` to satisfy its required props.
        return <ManageCourseAssessments course={course} />;
      case 'CO-PO Mapping':
        // FIX: CoPoMappingMatrix fetches its own data via context, so it does not require props.
        return <CoPoMappingMatrix />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{course.name} ({course.code})</h1>
          <p className="text-gray-500">Manage course details, outcomes, and assessments.</p>
        </div>
         <button 
            onClick={() => navigate(`/courses/${courseId}/report`)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            View Student Report
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
};


export default CourseDetail;