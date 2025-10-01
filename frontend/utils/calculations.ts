import { AppData, CourseOutcome, Student } from '../types';

// Calculates a single student's attainment percentage for a single CO across all assessments in a course.
export const calculateStudentCoAttainmentForCourse = (
  student: Student,
  co: CourseOutcome,
  courseId: string,
  data: AppData
): number => {
  let totalObtainedMarks = 0;
  let totalMaxMarks = 0;
  const assessmentsForCourse = data.assessments.filter(
    (a) => a.courseId === courseId
  );

  assessmentsForCourse.forEach((assessment) => {
    const questionsForCo = assessment.questions.filter((q) =>
      q.coIds.includes(co.id)
    );

    if (questionsForCo.length > 0) {
      const studentMark = data.marks.find(
        (m) => m.studentId === student.id && m.assessmentId === assessment.id
      );
      questionsForCo.forEach((question) => {
        totalMaxMarks += question.maxMarks;
        if (studentMark) {
          const score = studentMark.scores.find((s) => s.q === question.q);
          if (score) {
            totalObtainedMarks += score.marks;
          }
        }
      });
    }
  });

  return totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;
};

// Calculates the overall attainment level (0-3) for a CO based on the percentage of students meeting the target.
export const calculateOverallCoLevel = (
  co: CourseOutcome,
  data: AppData
): number => {
  const course = data.courses.find((c) => c.id === co.courseId);
  if (!course) return 0;

  const enrolledStudentIds = new Set(
    data.enrollments.filter((e) => e.courseId === course.id).map((e) => e.studentId)
  );
  const studentsInCourse = data.students.filter((s) =>
    enrolledStudentIds.has(s.id)
  );

  if (studentsInCourse.length === 0) return 0;

  let studentsMeetingTargetCount = 0;
  studentsInCourse.forEach((student) => {
    const attainmentPercentage = calculateStudentCoAttainmentForCourse(
      student,
      co,
      course.id,
      data
    );
    if (attainmentPercentage >= course.target) {
      studentsMeetingTargetCount++;
    }
  });

  const percentStudentsMeetingTarget =
    (studentsMeetingTargetCount / studentsInCourse.length) * 100;

  if (percentStudentsMeetingTarget >= course.attainmentLevels.level3) return 3;
  if (percentStudentsMeetingTarget >= course.attainmentLevels.level2) return 2;
  if (percentStudentsMeetingTarget >= course.attainmentLevels.level1) return 1;
  return 0;
};
