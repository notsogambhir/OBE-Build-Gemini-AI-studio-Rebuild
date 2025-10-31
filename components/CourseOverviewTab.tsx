import React, { useState, useEffect, useMemo } from 'react';
import { Course } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import SaveBar from './SaveBar';

interface CourseOverviewTabProps {
  course: Course;
}

const CourseOverviewTab: React.FC<CourseOverviewTabProps> = ({ course }) => {
  const { setData, currentUser } = useAppContext();
  const isCoordinator = currentUser?.role === 'Program Co-ordinator';

  const [draftCourse, setDraftCourse] = useState<Course>(course);
  const [initialCourse, setInitialCourse] = useState<Course>(course);

  useEffect(() => {
    setDraftCourse(course);
    setInitialCourse(course);
  }, [course]);
  
  const isDirty = useMemo(() => JSON.stringify(initialCourse) !== JSON.stringify(draftCourse), [initialCourse, draftCourse]);

  const updateDraftCourseField = (field: keyof Course, value: any) => {
    setDraftCourse(prev => ({ ...prev, [field]: value }));
  };

  const updateDraftAttainmentLevel = (level: 'level1' | 'level2' | 'level3', value: number) => {
     setDraftCourse(prev => ({ ...prev, attainmentLevels: { ...prev.attainmentLevels, [level]: value } }));
  };

  const handleSave = () => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === course.id ? draftCourse : c)
    }));
    setInitialCourse(draftCourse); // Update the baseline for isDirty check
    alert("Changes saved successfully!");
  };

  const handleCancel = () => {
    setDraftCourse(initialCourse);
  };


  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">CO Target (%)</label>
          <input 
            type="number" 
            value={draftCourse.target} 
            onChange={e => updateDraftCourseField('target', Number(e.target.value))} 
            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!isCoordinator}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Internal Weightage (%)</label>
          <input 
            type="number" 
            value={draftCourse.internalWeightage} 
            onChange={e => updateDraftCourseField('internalWeightage', Number(e.target.value))} 
            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!isCoordinator}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">External Weightage (%)</label>
          <input 
            type="number" 
            value={draftCourse.externalWeightage} 
            onChange={e => updateDraftCourseField('externalWeightage', Number(e.target.value))} 
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
                value={draftCourse.attainmentLevels.level3} 
                onChange={e => updateDraftAttainmentLevel('level3', Number(e.target.value))} 
                className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isCoordinator}
              />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700">Level 2 (&ge; Y % of students)</label>
              <input 
                type="number" 
                value={draftCourse.attainmentLevels.level2} 
                onChange={e => updateDraftAttainmentLevel('level2', Number(e.target.value))} 
                className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isCoordinator}
              />
          </div>
           <div>
              <label className="block text-sm font-medium text-gray-700">Level 1 (&ge; Z % of students)</label>
              <input 
                type="number" 
                value={draftCourse.attainmentLevels.level1} 
                onChange={e => updateDraftAttainmentLevel('level1', Number(e.target.value))} 
                className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isCoordinator}
              />
          </div>
        </div>
      </div>

      <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default CourseOverviewTab;