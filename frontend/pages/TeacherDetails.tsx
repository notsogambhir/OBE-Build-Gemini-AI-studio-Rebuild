import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { calculateOverallCoLevel } from '../utils/calculations';

const TeacherDetails: React.FC = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const { data } = useAppContext();

  const teacher = useMemo(() => data?.users.find((u) => u.id === teacherId), [
    data,
    teacherId,
  ]);

  const assignedCoursesData = useMemo(() => {
    if (!teacher || !data) return [];
    const courses = data.courses.filter((c) => c.teacherId === teacher.id);

    return courses.map((course) => {
      const courseOutcomes = data.courseOutcomes.filter(
        (co) => co.courseId === course.id
      );

      let totalCoLevels = 0;
      courseOutcomes.forEach((co) => {
        totalCoLevels += calculateOverallCoLevel(co, data);
      });
      // Average attainment across all COs, on a scale of 0-3, then converted to a percentage.
      const overallCoAttainment =
        courseOutcomes.length > 0
          ? (totalCoLevels / (courseOutcomes.length * 3)) * 100
          : 0;

      const assessments = data.assessments
        .filter((a) => a.courseId === course.id)
        .map((assessment) => ({
          ...assessment,
          hasMarks: data.marks.some((m) => m.assessmentId === assessment.id),
        }));

      return {
        ...course,
        overallCoAttainment,
        assessments,
      };
    });
  }, [data, teacher]);

  if (!data) return <div>Loading...</div>;

  if (!teacher) {
    return (
      <div className="text-center p-8 text-red-500">Teacher not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">
          {teacher.name}'s Dashboard
        </h1>
        <p className="text-gray-500">
          Employee ID: {teacher.employeeId} | Overview of assigned courses and
          their status.
        </p>
      </div>

      {assignedCoursesData.map((course) => (
        <div key={course.id} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {course.name} ({course.code})
              </h2>
              <p
                className={`font-semibold text-lg ${
                  course.overallCoAttainment >= course.target
                    ? 'text-green-600'
                    : 'text-orange-500'
                }`}
              >
                Overall CO Attainment: {course.overallCoAttainment.toFixed(2)}%
              </p>
            </div>
            <Link
              to={`/courses/${course.id}`}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Manage Course
            </Link>
          </div>
          <div className="mt-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Assessments
            </h3>
            <div className="space-y-2">
              {course.assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
                >
                  <p className="text-gray-800">{assessment.name}</p>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      assessment.hasMarks
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {assessment.hasMarks ? 'Uploaded' : 'Pending'}
                  </span>
                </div>
              ))}
              {course.assessments.length === 0 && (
                <p className="text-gray-500">
                  No assessments created for this course yet.
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      {assignedCoursesData.length === 0 && (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">
            This teacher has not been assigned any courses yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeacherDetails;
