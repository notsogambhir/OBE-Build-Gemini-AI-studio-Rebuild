import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Course, CourseStatus, Enrollment, User } from '../types';
import ExcelUploader from '../components/ExcelUploader';
import ConfirmationModal from '../components/ConfirmationModal';
import CollapsibleSection from '../components/ui/CollapsibleSection';

const CoursesList: React.FC = () => {
  const {
    selectedProgram,
    selectedBatch,
    data,
    setData,
    currentUser,
    selectedCollegeId,
  } = useAppContext();
  const navigate = useNavigate();

  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const isProgramCoordinator = currentUser?.role === 'Program Co-ordinator';
  const isAdmin = currentUser?.role === 'Admin';
  const canManageCourses = isProgramCoordinator || isAdmin;

  const { activeCourses, futureCourses, completedCourses, teachersForPC, pageTitle } =
    useMemo(() => {
      if (!data)
        return {
          activeCourses: [],
          futureCourses: [],
          completedCourses: [],
          teachersForPC: [],
          pageTitle: 'Courses',
        };

      let courses: Course[];

      if (isAdmin) {
        courses = data.courses;
        if (selectedProgram) {
          courses = courses.filter((c) => c.programId === selectedProgram.id);
        } else if (selectedCollegeId) {
          const programIdsInCollege = new Set(
            data.programs
              .filter((p) => p.collegeId === selectedCollegeId)
              .map((p) => p.id)
          );
          courses = courses.filter((c) => programIdsInCollege.has(c.programId));
        }
      } else if (currentUser?.role === 'Teacher') {
        courses = data.courses.filter(
          (c) =>
            c.teacherId === currentUser.id ||
            (c.sectionTeacherIds &&
              Object.values(c.sectionTeacherIds).includes(currentUser.id))
        );
      } else {
        // Program Co-ordinator
        courses = data.courses.filter(
          (c) => c.programId === selectedProgram?.id
        );
      }

      courses = courses.sort((a, b) => a.code.localeCompare(b.code));

      let teachersForPC: User[] = [];
      if (isProgramCoordinator) {
        const myManagedTeacherIds = new Set(
          data.users
            .filter(
              (u) =>
                u.role === 'Teacher' &&
                u.programCoordinatorIds?.includes(currentUser.id)
            )
            .map((u) => u.id)
        );
        teachersForPC = data.users.filter((u) => myManagedTeacherIds.has(u.id));
      } else if (isAdmin) {
        teachersForPC = data.users.filter((u) => u.role === 'Teacher');
      }

      const title = isAdmin
        ? selectedProgram
          ? `Courses for ${selectedProgram.name}`
          : selectedCollegeId
          ? `Courses in ${
              data.colleges.find((c) => c.id === selectedCollegeId)?.name
            }`
          : 'All Courses'
        : currentUser?.role === 'Teacher'
        ? 'My Assigned Courses'
        : 'Courses';

      return {
        activeCourses: courses.filter((c) => c.status === 'Active'),
        futureCourses: courses.filter((c) => c.status === 'Future'),
        completedCourses: courses.filter((c) => c.status === 'Completed'),
        teachersForPC,
        pageTitle: title,
      };
    }, [
      data,
      selectedProgram,
      currentUser,
      selectedCollegeId,
      isProgramCoordinator,
      isAdmin,
    ]);

  const canAddCourse =
    canManageCourses && (isProgramCoordinator || (isAdmin && selectedProgram));

  const handleExcelUpload = useCallback((uploadedData: { code: string; name: string }[]) => {
    if (!selectedProgram || !setData) {
      alert('Please select a program before bulk uploading courses.');
      return;
    }
    // TODO: Replace with API call
    const newCourses: Course[] = uploadedData.map((row, index) => ({
      id: `c_excel_${Date.now()}_${index}`,
      code: row.code || 'N/A',
      name: row.name || 'Untitled Course',
      programId: selectedProgram.id,
      target: 50,
      internalWeightage: 25,
      externalWeightage: 75,
      attainmentLevels: { level3: 80, level2: 70, level1: 50 },
      status: 'Future',
      teacherId: null,
    }));
    setData((prev) =>
      prev ? { ...prev, courses: [...prev.courses, ...newCourses] } : null
    );
  }, [selectedProgram, setData]);

  const handleAddCourse = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseName.trim() || !selectedProgram || !setData)
      return;
    // TODO: Replace with API call
    const newCourse: Course = {
      id: `c_manual_${Date.now()}`,
      programId: selectedProgram.id,
      code: newCourseCode.trim(),
      name: newCourseName.trim(),
      target: 50,
      internalWeightage: 25,
      externalWeightage: 75,
      attainmentLevels: { level3: 80, level2: 70, level1: 50 },
      status: 'Future',
      teacherId: null,
    };
    setData((prev) =>
      prev ? { ...prev, courses: [...prev.courses, newCourse] } : null
    );
    setNewCourseCode('');
    setNewCourseName('');
  }, [newCourseCode, newCourseName, selectedProgram, setData]);

  const performStatusUpdate = useCallback((ids: string[], newStatus: CourseStatus) => {
    if (!setData) return;
    // TODO: Replace with API call
    setData((prev) => {
      if (!prev) return null;
      let newEnrollments: Enrollment[] = [...prev.enrollments];
      const updatedCourses = prev.courses.map((c) => {
        if (ids.includes(c.id)) {
          if (newStatus === 'Active' && c.status !== 'Active') {
            if (selectedProgram && selectedBatch) {
              const sectionsForBatch = prev.sections.filter(
                (s) =>
                  s.programId === selectedProgram.id && s.batch === selectedBatch
              );
              const sectionIdsForBatch = new Set(
                sectionsForBatch.map((s) => s.id)
              );

              const activeStudentsForBatch = prev.students.filter(
                (s) =>
                  s.programId === selectedProgram.id &&
                  s.status === 'Active' &&
                  s.sectionId &&
                  sectionIdsForBatch.has(s.sectionId)
              );

              const existingEnrollments = new Set(
                newEnrollments
                  .filter((e) => e.courseId === c.id)
                  .map((e) => e.studentId)
              );

              const enrollmentsToAdd = activeStudentsForBatch
                .filter((s) => !existingEnrollments.has(s.id))
                .map((s) => ({
                  courseId: c.id,
                  studentId: s.id,
                  sectionId: s.sectionId,
                }));

              newEnrollments.push(...enrollmentsToAdd);
            }
          }
          return { ...c, status: newStatus };
        }
        return c;
      });
      return { ...prev, courses: updatedCourses, enrollments: newEnrollments };
    });
    setSelectedCourseIds([]);
    setConfirmation(null);
  }, [setData, selectedBatch, selectedProgram]);

  const promptStatusChange = useCallback((ids: string[], newStatus: CourseStatus) => {
    if (!data) return;
    let message = '';
    if (ids.length === 1) {
      const courseName = data.courses.find((c) => c.id === ids[0])?.name;
      message = `Are you sure you want to mark '${courseName}' as ${newStatus}?`;
    } else {
      message = `Are you sure you want to mark ${ids.length} selected courses as ${newStatus}?`;
    }
    if (newStatus === 'Active') {
      if (!selectedBatch) {
        alert('Please select a batch from the sidebar before activating a course.');
        return;
      }
      message += ` This will enroll all active students from the ${selectedBatch} batch into the course.`;
    }
    setConfirmation({
      isOpen: true,
      title: 'Confirm Status Change',
      message,
      onConfirm: () => performStatusUpdate(ids, newStatus),
    });
  }, [data, selectedBatch, performStatusUpdate]);

  const performTeacherAssignment = useCallback((courseId: string, teacherId: string) => {
    if (!setData) return;
    // TODO: Replace with API call
    setData((prev) =>
      prev
        ? {
            ...prev,
            courses: prev.courses.map((c) =>
              c.id === courseId ? { ...c, teacherId: teacherId || null } : c
            ),
          }
        : null
    );
    setConfirmation(null);
  }, [setData]);

  const handleAssignTeacherChange = useCallback((courseId: string, newTeacherId: string) => {
    if (!data) return;
    const course = data.courses.find((c) => c.id === courseId);
    if (!course) return;

    if (course.teacherId && course.teacherId !== newTeacherId) {
      setConfirmation({
        isOpen: true,
        title: 'Confirm Teacher Reassignment',
        message:
          'Changing the assigned teacher will unassign the course from the previous teacher. Are you sure you want to proceed?',
        onConfirm: () => performTeacherAssignment(courseId, newTeacherId),
      });
    } else {
      performTeacherAssignment(courseId, newTeacherId);
    }
  }, [data, performTeacherAssignment]);

  const handleToggleSelection = useCallback((courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  }, []);

  const handleToggleSelectAll = useCallback((courseIds: string[]) => {
    const allSelected = courseIds.every((id) => selectedCourseIds.includes(id));
    if (allSelected) {
      setSelectedCourseIds((prev) =>
        prev.filter((id) => !courseIds.includes(id))
      );
    } else {
      setSelectedCourseIds((prev) => [...new Set([...prev, ...courseIds])]);
    }
  }, [selectedCourseIds]);

  const renderCourseTable = useCallback((courses: Course[]) => {
    const courseIds = courses.map((c) => c.id);
    const areAllSelected =
      courseIds.length > 0 && courseIds.every((id) => selectedCourseIds.includes(id));

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {canManageCourses && (
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={areAllSelected}
                    onChange={() => handleToggleSelectAll(courseIds)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course Name
              </th>
              {(isProgramCoordinator || isAdmin) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Teacher
                </th>
              )}
              {canManageCourses && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map((course) => (
              <tr
                key={course.id}
                className={`hover:bg-gray-50 ${
                  selectedCourseIds.includes(course.id) ? 'bg-indigo-50' : ''
                }`}
              >
                {canManageCourses && (
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedCourseIds.includes(course.id)}
                      onChange={() => handleToggleSelection(course.id)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {course.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {course.name}
                </td>
                {(isProgramCoordinator || isAdmin) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={course.teacherId || ''}
                      onChange={(e) =>
                        handleAssignTeacherChange(course.id, e.target.value)
                      }
                      className="p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">-- Unassigned --</option>
                      {teachersForPC.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
                {canManageCourses && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <select
                      value={course.status}
                      onChange={(e) =>
                        promptStatusChange(
                          [course.id],
                          e.target.value as CourseStatus
                        )
                      }
                      className="p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="Future">Future</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [canManageCourses, isAdmin, isProgramCoordinator, selectedCourseIds, teachersForPC, handleAssignTeacherChange, handleToggleSelectAll, handleToggleSelection, navigate, promptStatusChange]);

  if (!data) {
    return <div className="text-center p-8">Loading course data...</div>;
  }

  if (currentUser?.role === 'Teacher') {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
        <div className="bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 p-4 border-b">
            Active Courses ({activeCourses.length})
          </h2>
          {renderCourseTable(activeCourses)}
        </div>
        <CollapsibleSection
          title="Completed Courses"
          count={completedCourses.length}
        >
          {renderCourseTable(completedCourses)}
        </CollapsibleSection>
        <CollapsibleSection title="Future Courses" count={futureCourses.length}>
          {renderCourseTable(futureCourses)}
        </CollapsibleSection>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
        {canAddCourse && (
          <ExcelUploader<{ code: string; name: string }>
            onFileUpload={handleExcelUpload}
            label="Bulk Upload"
            format="cols: code, name"
          />
        )}
      </div>

      {canAddCourse && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <form
            onSubmit={handleAddCourse}
            className="flex flex-wrap md:flex-nowrap gap-4 items-end"
          >
            <div className="flex-grow">
              <label
                htmlFor="new-course-code"
                className="text-sm font-medium text-gray-600 block"
              >
                Course Code
              </label>
              <input
                id="new-course-code"
                type="text"
                placeholder="e.g. CS101"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-white text-gray-900"
                required
              />
            </div>
            <div className="flex-grow-[2]">
              <label
                htmlFor="new-course-name"
                className="text-sm font-medium text-gray-600 block"
              >
                Course Name
              </label>
              <input
                id="new-course-name"
                type="text"
                placeholder="e.g. Intro to Programming"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-white text-gray-900"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg h-[42px] w-full md:w-auto"
            >
              Add Course
            </button>
          </form>
        </div>
      )}

      {selectedCourseIds.length > 0 && (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center justify-between sticky top-2 z-10">
          <span className="font-semibold">
            {selectedCourseIds.length} course(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => promptStatusChange(selectedCourseIds, 'Future')}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm"
            >
              Mark as Future
            </button>
            <button
              onClick={() => promptStatusChange(selectedCourseIds, 'Active')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded-lg text-sm"
            >
              Mark as Active
            </button>
            <button
              onClick={() => promptStatusChange(selectedCourseIds, 'Completed')}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm"
            >
              Mark as Completed
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 p-4 border-b">
          Active Courses ({activeCourses.length})
        </h2>
        {renderCourseTable(activeCourses)}
      </div>

      <CollapsibleSection title="Future Courses" count={futureCourses.length}>
        {renderCourseTable(futureCourses)}
      </CollapsibleSection>

      <CollapsibleSection
        title="Completed Courses"
        count={completedCourses.length}
      >
        {renderCourseTable(completedCourses)}
      </CollapsibleSection>

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

export default CoursesList;
