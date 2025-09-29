import React, { useMemo } from 'react';
import { Student } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import Modal from './Modal';

interface StudentDetailsModalProps {
  student: Student;
  onClose: () => void;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ student, onClose }) => {
  const { data } = useAppContext();

  const studentCourseData = useMemo(() => {
    const enrolledCourseIds = new Set(data.enrollments.filter(e => e.studentId === student.id).map(e => e.courseId));
    const enrolledCourses = data.courses.filter(c => enrolledCourseIds.has(c.id));

    return enrolledCourses.map(course => {
      const courseOutcomes = data.courseOutcomes.filter(co => co.courseId === course.id);

      if (course.status === 'Future') {
        return { course, coAttainments: null };
      }

      const coAttainments = courseOutcomes.map(co => {
        let obtainedMarks = 0;
        let possibleMarks = 0;

        const assessmentsForCourse = data.assessments.filter(a => a.courseId === course.id);

        assessmentsForCourse.forEach(assessment => {
          const questionsForCo = assessment.questions.filter(q => q.coIds.includes(co.id));

          questionsForCo.forEach(question => {
            const studentMark = data.marks.find(m => m.assessmentId === assessment.id && m.studentId === student.id);
            if (studentMark) {
              const score = studentMark.scores.find(s => s.q === question.q);
              if (score !== undefined) {
                obtainedMarks += score.marks;
                possibleMarks += question.maxMarks;
              }
            }
          });
        });

        const percentage = possibleMarks > 0 ? (obtainedMarks / possibleMarks) * 100 : 0;
        
        return {
          coNumber: co.number,
          percentage: percentage.toFixed(2),
        };
      });

      return { course, coAttainments };
    });
  }, [student, data]);

  return (
    <Modal title={`Student Details`} onClose={onClose}>
      <div className="p-6">
        <div className="mb-6 pb-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
          <p className="text-sm text-gray-500">Student ID: {student.id}</p>
        </div>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <h4 className="font-semibold text-gray-700">Enrolled Courses</h4>
          {studentCourseData.length > 0 ? (
            studentCourseData.map(({ course, coAttainments }) => (
              <div key={course.id} className="bg-gray-50 p-4 rounded-lg border">
                <p className="font-bold text-gray-800">{course.name} ({course.code})</p>
                
                {coAttainments ? (
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                    {coAttainments.map(attainment => (
                      <div key={attainment.coNumber}>
                        <span className="font-semibold">{attainment.coNumber}:</span>
                        <span className="ml-2 text-gray-600">{attainment.percentage}%</span>
                      </div>
                    ))}
                    {coAttainments.length === 0 && <p className="text-gray-500 col-span-full">No COs defined for this course.</p>}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500 italic">(Future Course - No attainment data)</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">This student is not enrolled in any courses.</p>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Close</button>
        </div>
      </div>
    </Modal>
  );
};

export default StudentDetailsModal;
