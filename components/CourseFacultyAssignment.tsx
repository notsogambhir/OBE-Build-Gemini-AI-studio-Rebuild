import React, { useState, useMemo, useEffect } from 'react';
import { Course, User, Section } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import SaveBar from './SaveBar';
import ConfirmationModal from './ConfirmationModal';

interface CourseFacultyAssignmentProps {
  course: Course;
}

type AssignmentMode = 'single' | 'section';

const CourseFacultyAssignment: React.FC<CourseFacultyAssignmentProps> = ({ course }) => {
  const { data, setData, currentUser } = useAppContext();
  
  const [draftCourse, setDraftCourse] = useState<Course>(course);
  const [initialCourse, setInitialCourse] = useState<Course>(course);

  useEffect(() => {
    setDraftCourse(course);
    setInitialCourse(course);
  }, [course]);

  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>(
    course.sectionTeacherIds && Object.keys(course.sectionTeacherIds).length > 0 ? 'section' : 'single'
  );

  const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

  const { managedTeachers, courseSections } = useMemo(() => {
    let teachers: User[] = [];
    if (currentUser?.role === 'Program Co-ordinator') {
        const myManagedTeacherIds = new Set(data.users
            .filter(u => u.role === 'Teacher' && u.programCoordinatorIds?.includes(currentUser.id))
            .map(u => u.id));
        teachers = data.users.filter(u => myManagedTeacherIds.has(u.id));
    }

    const enrolledSectionIds = new Set(data.enrollments
        .filter(e => e.courseId === course.id && e.sectionId)
        .map(e => e.sectionId)
    );
    
    const sections = data.sections.filter(s => enrolledSectionIds.has(s.id));
    
    return { managedTeachers: teachers, courseSections: sections };
  }, [data, currentUser, course.id]);
  
  const isDirty = useMemo(() => JSON.stringify(draftCourse) !== JSON.stringify(initialCourse), [draftCourse, initialCourse]);

  const handleModeChange = (mode: AssignmentMode) => {
    // No change if clicking the active mode
    if (mode === assignmentMode) return;

    // Switching TO 'section' mode
    if (mode === 'section') {
      setConfirmation({
        isOpen: true,
        title: "Confirm Assignment Mode Switch",
        message: "Switching to 'Assign by Section' will clear any existing single-teacher assignment for this course. Are you sure you want to proceed?",
        onConfirm: () => {
          setAssignmentMode('section');
          setDraftCourse(prev => ({ ...prev, teacherId: null }));
          setConfirmation(null);
        }
      });
    } 
    // Switching TO 'single' mode
    else if (mode === 'single') {
      const hasSectionAssignments = draftCourse.sectionTeacherIds && Object.keys(draftCourse.sectionTeacherIds).length > 0;
      if (hasSectionAssignments) {
        setConfirmation({
          isOpen: true,
          title: "Confirm Assignment Mode Switch",
          message: "Switching to 'Single Teacher' will clear all existing section-specific teacher assignments. Are you sure you want to proceed?",
          onConfirm: () => {
            setAssignmentMode('single');
            setDraftCourse(prev => {
              const { sectionTeacherIds, ...rest } = prev;
              return rest;
            });
            setConfirmation(null);
          }
        });
      } else {
        // No section assignments to clear, so just switch
        setAssignmentMode(mode);
      }
    }
  };

  const handleSingleTeacherChange = (teacherId: string) => {
    setDraftCourse(prev => ({ ...prev, teacherId: teacherId || null }));
  };

  const handleSectionTeacherChange = (sectionId: string, teacherId: string) => {
    setDraftCourse(prev => {
        const newSectionTeachers = { ...(prev.sectionTeacherIds || {}) };
        if (teacherId) {
            newSectionTeachers[sectionId] = teacherId;
        } else {
            delete newSectionTeachers[sectionId];
        }
        return { ...prev, sectionTeacherIds: newSectionTeachers };
    });
  };

  const handleSave = () => {
    setData(prev => ({
        ...prev,
        courses: prev.courses.map(c => c.id === course.id ? draftCourse : c)
    }));
    setInitialCourse(draftCourse);
    alert("Faculty assignments saved!");
  };

  const handleCancel = () => {
    setDraftCourse(initialCourse);
    // Also reset the mode to match the initial state
    setAssignmentMode(initialCourse.sectionTeacherIds && Object.keys(initialCourse.sectionTeacherIds).length > 0 ? 'section' : 'single');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">Faculty Assignment</h2>
           <div className="flex items-center space-x-2 rounded-lg bg-gray-200 p-1">
                <button 
                    onClick={() => handleModeChange('single')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${assignmentMode === 'single' ? 'bg-white text-gray-800 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                    Single Teacher
                </button>
                <button 
                    onClick={() => handleModeChange('section')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${assignmentMode === 'section' ? 'bg-white text-gray-800 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                    Assign by Section
                </button>
            </div>
      </div>

      {assignmentMode === 'single' && (
        <div className="p-4 border rounded-lg bg-gray-50">
           <label htmlFor="single-teacher-select" className="block text-sm font-medium text-gray-700">
               Assign a single teacher for the entire course
            </label>
           <select
                id="single-teacher-select"
                value={draftCourse.teacherId || ''}
                onChange={(e) => handleSingleTeacherChange(e.target.value)}
                className="mt-2 block w-full max-w-sm pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                <option value="">-- Unassigned --</option>
                {managedTeachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">This teacher will be the default unless overridden by section-specific assignments.</p>
        </div>
      )}

      {assignmentMode === 'section' && (
         <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-md font-medium text-gray-700 mb-4">Assign a teacher to each section</h3>
            <div className="space-y-3">
                {courseSections.map(section => (
                    <div key={section.id} className="grid grid-cols-3 items-center gap-4">
                        <label htmlFor={`section-teacher-${section.id}`} className="font-semibold text-gray-800 text-sm">
                            Section {section.name}
                        </label>
                         <select
                            id={`section-teacher-${section.id}`}
                            value={draftCourse.sectionTeacherIds?.[section.id] || ''}
                            onChange={(e) => handleSectionTeacherChange(section.id, e.target.value)}
                            className="col-span-2 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">-- Use Course Default --</option>
                            {managedTeachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                        </select>
                    </div>
                ))}
                 {courseSections.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No sections found for this course. Enroll students to see sections here.</p>
                )}
            </div>
         </div>
      )}
      <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
      {confirmation && (
        <ConfirmationModal
            isOpen={confirmation.isOpen}
            title={confirmation.title}
            message={confirmation.message}
            onConfirm={confirmation.onConfirm}
            onClose={() => setConfirmation(null)}
        />
       )}
    </div>
  );
};

export default CourseFacultyAssignment;