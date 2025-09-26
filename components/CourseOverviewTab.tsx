import React from 'react';
import { Course } from '../types';
import { useAppContext } from '../hooks/useAppContext';

interface CourseOverviewTabProps {
  course: Course;
}

const CourseOverviewTab: React.FC<CourseOverviewTabProps> = ({ course }) => {
  const { setData, currentUser } = useAppContext();
  const isCoordinator = currentUser?.role === 'Program Co-ordinator';

  const updateCourseField = (field: keyof Course, value: any) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === course.id ? { ...c, [field]: value } : c)
    }));
  };

  const updateAttainmentLevel = (level: 'level1' | 'level2' | 'level3', value: number) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map(c =>
        c.id === course.id
          ? { ...c, attainmentLevels: { ...c.attainmentLevels, [level]: value } }
          : c
      )
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">CO Target (%)</label>
          <input 
            type="number" 
            value={course.target} 
            onChange={e => updateCourseField('target', Number(e.target.value))} 
            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!isCoordinator}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Internal Weightage (%)</label>
          <input 
            type="number" 
            value={course.internalWeightage} 
            onChange={e => updateCourseField('internalWeightage', Number(e.target.value))} 
            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!isCoordinator}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">External Weightage (%)</label>
          <input 
            type="number" 
            value={course.externalWeightage} 
            onChange={e => updateCourseField('externalWeightage', Number(e.target.value))} 
            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!isCoordinator}
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Attainment Level Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
              <label className="block text-sm font-medium text-gray-700">Level 3 (&ge; X % of students)</label>
              <input 
                type="number" 
                value={course.attainmentLevels.level3} 
                onChange={e => updateAttainmentLevel('level3', Number(e.target.value))} 
                className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isCoordinator}
              />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700">Level 2 (&ge; Y % of students)</label>
              <input 
                type="number" 
                value={course.attainmentLevels.level2} 
                onChange={e => updateAttainmentLevel('level2', Number(e.target.value))} 
                className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isCoordinator}
              />
          </div>
           <div>
              <label className="block text-sm font-medium text-gray-700">Level 1 (&ge; Z % of students)</label>
              <input 
                type="number" 
                value={course.attainmentLevels.level1} 
                onChange={e => updateAttainmentLevel('level1', Number(e.target.value))} 
                className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isCoordinator}
              />
          </div>
        </div>
      </div>

    </div>
  );
};

export default CourseOverviewTab;