import React, { useState, useMemo } from 'react';
// FIX: Changed react-router-dom import to namespace import to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import ManageCourseOutcomes from '../components/ManageCourseOutcomes';
import ManageCourseAssessments from '../components/ManageCourseAssessments';
import CoPoMappingMatrix from '../components/CoPoMappingMatrix';
import CourseOverviewTab from '../components/CourseOverviewTab';
import StudentCOAttainmentReport from './StudentCOAttainmentReport';
import CourseFacultyAssignment from '../components/CourseFacultyAssignment';
import CourseCoAttainment from '../components/CourseCoAttainment';
import { Course } from '../types';

type Tab = 'Overview' | 'COs' | 'Assessments' | 'CO-PO Mapping' | 'CO Attainments' | 'Student Reports' | 'Faculty Assignment';

const CourseDetail: React.FC = () => {
<<<<<<< HEAD
  // `useParams` is a hook from React Router that gives us access to URL parameters.
  const { courseId } = ReactRouterDOM.useParams<{ courseId: string }>();
  // We get our app's data and the current user from the "magic backpack".
=======
  const { courseId } = useParams<{ courseId: string }>();
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)
  const { data, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const course = useMemo(() => data.courses.find(c => c.id === courseId), [courseId, data.courses]);
  
  if (currentUser?.role === 'Teacher' && course && course.teacherId !== currentUser.id && (!course.sectionTeacherIds || !Object.values(course.sectionTeacherIds).includes(currentUser.id))) {
    return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="text-gray-500 mt-2">You are not assigned to this course.</p>
        </div>
    );
  }

  if (!course) {
    return <div className="text-center text-red-500 p-8">Course not found.</div>;
  }

  const isCoordinator = currentUser?.role === 'Program Co-ordinator';
  const isAdmin = currentUser?.role === 'Admin';

  const tabs: Tab[] = ['Overview', 'COs', 'Assessments', 'CO-PO Mapping', 'CO Attainments'];

  if (isCoordinator || isAdmin) {
    tabs.push('Faculty Assignment');
  }
  
  tabs.push('Student Reports');


  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <CourseOverviewTab course={course} />;
      case 'COs':
        return <ManageCourseOutcomes />;
      case 'Assessments':
        return <ManageCourseAssessments course={course} />;
      case 'CO-PO Mapping':
        return <CoPoMappingMatrix />;
      case 'CO Attainments':
        return <CourseCoAttainment course={course} />;
      case 'Faculty Assignment':
        return (isCoordinator || isAdmin) ? <CourseFacultyAssignment course={course} /> : null;
      case 'Student Reports':
        return <StudentCOAttainmentReport />;
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
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
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