import React, { useMemo, useState } from 'react';
import { Course } from '../types';
import { useAppContext } from '../hooks/useAppContext';

interface CourseCoAttainmentProps {
  course: Course;
}

const CourseCoAttainment: React.FC<CourseCoAttainmentProps> = ({ course }) => {
  const { data, currentUser } = useAppContext();
  const isPCorAdmin = currentUser?.role === 'Program Co-ordinator' || currentUser?.role === 'Admin';
  
  const [selectedScope, setSelectedScope] = useState<'overall' | string>('overall');

  const courseSections = useMemo(() => {
    const enrolledSectionIds = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId).map(e => e.sectionId!));
    return data.sections.filter(s => enrolledSectionIds.has(s.id)).sort((a,b) => a.name.localeCompare(b.name));
  }, [data.enrollments, data.sections, course.id]);

  const coAttainmentData = useMemo(() => {
    const courseOutcomes = data.courseOutcomes.filter(co => co.courseId === course.id).sort((a,b) => a.number.localeCompare(b.number));
    
    let relevantStudentIds: Set<string>;

    if (isPCorAdmin) {
        if (selectedScope === 'overall') {
            relevantStudentIds = new Set(data.enrollments.filter(e => e.courseId === course.id).map(e => e.studentId));
        } else {
            relevantStudentIds = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId === selectedScope).map(e => e.studentId));
        }
    } else { // Teacher logic
        const teacherId = currentUser!.id;
        const teacherSectionIds = new Set<string>();

        const allCourseSectionIds = new Set(courseSections.map(s => s.id));
        
        allCourseSectionIds.forEach(sectionId => {
            const sectionTeacher = course.sectionTeacherIds?.[sectionId];
            if (sectionTeacher && sectionTeacher === teacherId) {
                teacherSectionIds.add(sectionId);
            } else if (!sectionTeacher && course.teacherId === teacherId) {
                teacherSectionIds.add(sectionId);
            }
        });
        
        relevantStudentIds = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId && teacherSectionIds.has(e.sectionId)).map(e => e.studentId));
    }

    const studentsInScope = data.students.filter(s => relevantStudentIds.has(s.id) && s.status === 'Active');
    const totalStudents = studentsInScope.length;

    if (totalStudents === 0 || courseOutcomes.length === 0) {
        return { results: [], studentCount: 0 };
    }

    const sectionIdsForCourse = new Set(data.enrollments.filter(e => e.courseId === course.id && e.sectionId).map(e => e.sectionId!));
    const assessmentsForCourse = data.assessments.filter(a => sectionIdsForCourse.has(a.sectionId));

    const studentMarksMap = new Map<string, Map<string, Map<string, number>>>();
    data.marks.filter(m => relevantStudentIds.has(m.studentId)).forEach(mark => {
        if (!studentMarksMap.has(mark.studentId)) studentMarksMap.set(mark.studentId, new Map());
        const assessmentMap = studentMarksMap.get(mark.studentId)!;
        const scoreMap = new Map<string, number>();
        mark.scores.forEach(s => scoreMap.set(s.q, s.marks));
        assessmentMap.set(mark.assessmentId, scoreMap);
    });
        
    const coQuestionMap = new Map<string, { q: string; maxMarks: number; assessmentId: string }[]>();
    courseOutcomes.forEach(co => coQuestionMap.set(co.id, []));

    assessmentsForCourse.forEach(assessment => {
        assessment.questions.forEach(q => q.coIds.forEach(coId => coQuestionMap.get(coId)?.push({ q: q.q, maxMarks: q.maxMarks, assessmentId: assessment.id })));
    });

    const results = courseOutcomes.map(co => {
        const questionsForCo = coQuestionMap.get(co.id) || [];
        
        if (questionsForCo.length === 0) return { co, percentageMeetingTarget: 0, attainmentLevel: 0 };
        
        let studentsMeetingTarget = 0;
        studentsInScope.forEach(student => {
            const totalMaxCoMarks = questionsForCo.reduce((sum, q) => sum + q.maxMarks, 0);
            const studentAssessmentMarks = studentMarksMap.get(student.id);
            let totalObtainedCoMarks = 0;

            if (studentAssessmentMarks) {
                totalObtainedCoMarks = questionsForCo.reduce((sum, q) => sum + (studentAssessmentMarks.get(q.assessmentId)?.get(q.q) || 0), 0);
            }
            
            const studentCoPercentage = totalMaxCoMarks > 0 ? (totalObtainedCoMarks / totalMaxCoMarks) * 100 : 0;
            if (studentCoPercentage >= course.target) {
                studentsMeetingTarget++;
            }
        });

        const percentageMeetingTarget = (studentsMeetingTarget / totalStudents) * 100;
        
        let attainmentLevel = 0;
        if (percentageMeetingTarget >= course.attainmentLevels.level3) attainmentLevel = 3;
        else if (percentageMeetingTarget >= course.attainmentLevels.level2) attainmentLevel = 2;
        else if (percentageMeetingTarget >= course.attainmentLevels.level1) attainmentLevel = 1;

        return { co, percentageMeetingTarget, attainmentLevel };
    });

    return { results, studentCount: totalStudents };

  }, [data, course, currentUser, isPCorAdmin, selectedScope, courseSections]);

  const attainmentLevelColors: { [key: number]: string } = {
      3: 'bg-green-100 text-green-800', 2: 'bg-blue-100 text-blue-800',
      1: 'bg-yellow-100 text-yellow-800', 0: 'bg-red-100 text-red-800',
  };

  return (
      <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Course Outcome Attainment Summary</h2>
              <p className="text-sm text-gray-500">Based on {coAttainmentData.studentCount} active students in the selected scope.</p>
            </div>
            {isPCorAdmin && courseSections.length > 0 && (
                <div>
                    <label htmlFor="section-scope-select" className="block text-sm font-medium text-gray-700">View Attainment For:</label>
                    <select id="section-scope-select" value={selectedScope} onChange={e => setSelectedScope(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="overall">Overall Course</option>
                        {courseSections.map(section => (
                            <option key={section.id} value={section.id}>Section {section.name}</option>
                        ))}
                    </select>
                </div>
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-600">
              <h3 className="font-semibold mb-2">Thresholds for this Course:</h3>
              <ul className="list-disc list-inside">
                  <li><span className="font-bold">CO Target:</span> {course.target}% (Individual student must score this percentage on a CO)</li>
                  <li><span className="font-bold">Level 3:</span> At least {course.attainmentLevels.level3}% of students meet the CO target.</li>
                  <li><span className="font-bold">Level 2:</span> At least {course.attainmentLevels.level2}% of students meet the CO target.</li>
                  <li><span className="font-bold">Level 1:</span> At least {course.attainmentLevels.level1}% of students meet the CO target.</li>
              </ul>
          </div>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CO</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% Students Above Target</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attainment Level</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {coAttainmentData.results.map(({ co, percentageMeetingTarget, attainmentLevel }) => (
                          <tr key={co.id}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{co.number}</td>
                              <td className="px-6 py-4 whitespace-normal text-sm text-gray-600">{co.description}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold">
                                 <span className={percentageMeetingTarget >= course.attainmentLevels.level1 ? 'text-green-600' : 'text-red-600'}>
                                     {percentageMeetingTarget.toFixed(2)}%
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold">
                                 <span className={`px-4 py-1 rounded-full text-lg ${attainmentLevelColors[attainmentLevel]}`}>
                                     {attainmentLevel}
                                 </span>
                              </td>
                          </tr>
                      ))}
                      {coAttainmentData.results.length === 0 && (
                          <tr>
                              <td colSpan={4} className="text-center py-8 text-gray-500">
                                  No COs or student data available to calculate attainment.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
  );
};

export default CourseCoAttainment;