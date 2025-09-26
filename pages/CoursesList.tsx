import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Course, CourseStatus, Enrollment } from '../types';
import ExcelUploader from '../components/ExcelUploader';

const CoursesList: React.FC = () => {
  const { selectedProgram, data, setData, currentUser } = useAppContext();
  const navigate = useNavigate();

  // State for the new course inline form
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');

  const isCoordinator = currentUser?.role === 'Program Co-ordinator';

  const programCourses = useMemo(
    () => data.courses.filter((c) => c.programId === selectedProgram?.id).sort((a,b) => a.code.localeCompare(b.code)),
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
      attainmentLevels: { level3: 80, level2: 70, level1: 60 },
      status: 'Future', // Default status
    }));
    
    setData(prev => ({
        ...prev,
        courses: [...prev.courses, ...newCourses]
    }));
  };

  const handleAddCourse = () => {
      if (!newCourseCode.trim() || !newCourseName.trim() || !selectedProgram) {
        alert("Please provide both a course code and name.");
        return;
      }
      const newCourse: Course = {
        id: `c_manual_${Date.now()}`,
        programId: selectedProgram.id,
        code: newCourseCode.trim(),
        name: newCourseName.trim(),
        target: 60,
        internalWeightage: 40,
        externalWeightage: 60,
        attainmentLevels: { level3: 80, level2: 70, level1: 60 },
        status: 'Future', // Default status for new courses
      };
      setData(prev => ({
          ...prev,
          courses: [...prev.courses, newCourse]
      }));
      setNewCourseCode('');
      setNewCourseName('');
  }

  const handleStatusChange = (courseId: string, newStatus: CourseStatus) => {
    setData(prev => {
      const course = prev.courses.find(c => c.id === courseId);
      if (!course) return prev;

      let newEnrollments: Enrollment[] = [...prev.enrollments];

      // Auto-enroll active students when course becomes active
      if (newStatus === 'Active' && course.status !== 'Active') {
        const activeStudentsInProgram = prev.students.filter(
          s => s.programId === course.programId && s.status === 'Active'
        );
        const existingEnrollmentsForCourse = new Set(
          newEnrollments.filter(e => e.courseId === courseId).map(e => e.studentId)
        );
        
        const enrollmentsToAdd = activeStudentsInProgram
          .filter(student => !existingEnrollmentsForCourse.has(student.id))
          .map(student => ({ courseId: courseId, studentId: student.id }));
        
        newEnrollments.push(...enrollmentsToAdd);
      }

      const updatedCourses = prev.courses.map(c => 
        c.id === courseId ? { ...c, status: newStatus } : c
      );

      return {
        ...prev,
        courses: updatedCourses,
        enrollments: newEnrollments
      };
    });
  };


  // Teacher View
  if (currentUser?.role === 'Teacher') {
    const activeCourses = programCourses.filter(c => c.status === 'Active');
    const completedCourses = programCourses.filter(c => c.status === 'Completed');

    const renderTable = (courses: Course[], title: string) => (
       <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        {courses.length > 0 ? (
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
                {courses.map((course) => (
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
        ) : <p className="text-gray-500">No {title.toLowerCase()} found.</p>}
      </div>
    );

    return (
       <div className="space-y-8">
          {renderTable(activeCourses, "Active Courses")}
          {renderTable(completedCourses, "Completed Courses")}
       </div>
    );
  }

  // Program Coordinator and Admin View
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
        {isCoordinator && (
          <ExcelUploader<{ code: string; name: string }>
            onFileUpload={handleExcelUpload}
            label="Bulk Upload Courses"
            format="columns: code, name"
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
              {isCoordinator && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {programCourses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{course.name}</td>
                {isCoordinator && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <select
                      value={course.status}
                      onChange={(e) => handleStatusChange(course.id, e.target.value as CourseStatus)}
                      className="p-1 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Future">Future</option>
                    </select>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => navigate(`/courses/${course.id}`)} className="text-indigo-600 hover:text-indigo-800">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {isCoordinator && (
            <tfoot className="bg-gray-50/50">
              <tr>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    placeholder="New Course Code"
                    value={newCourseCode}
                    onChange={e => setNewCourseCode(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    placeholder="New Course Name"
                    value={newCourseName}
                    onChange={e => setNewCourseName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400"
                  />
                </td>
                <td></td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={handleAddCourse}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Add Course
                  </button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default CoursesList;