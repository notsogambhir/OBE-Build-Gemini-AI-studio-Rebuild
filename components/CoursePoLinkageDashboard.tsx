import React, { useMemo } from 'react';
import { ProgramOutcome, Course } from '../types';
import { useAppContext } from '../hooks/useAppContext';

interface CoursePoLinkageDashboardProps {
    programOutcomes: ProgramOutcome[];
    courses: Course[];
}

const CoursePoLinkageDashboard: React.FC<CoursePoLinkageDashboardProps> = ({ programOutcomes, courses }) => {
    const { data } = useAppContext();

    const courseLinkageData = useMemo(() => {
        return courses.map(course => {
            const courseOutcomes = data.courseOutcomes.filter(co => co.courseId === course.id);
            const enrolledStudentIds = new Set(data.enrollments.filter(e => e.courseId === course.id).map(e => e.studentId));
            const studentsInCourse = data.students.filter(s => enrolledStudentIds.has(s.id));

            // --- Calculate Overall CO Attainment ---
            let overallCoAttainment = 0;
            if (studentsInCourse.length > 0 && courseOutcomes.length > 0) {
                const assessmentsForCourse = data.assessments.filter(a => a.courseId === course.id);

                // Pre-compute maps for performance
                const coQuestionMap = new Map<string, { q: string; maxMarks: number; assessmentId: string }[]>();
                courseOutcomes.forEach(co => coQuestionMap.set(co.id, []));
                assessmentsForCourse.forEach(assessment => {
                    assessment.questions.forEach(q => {
                        q.coIds.forEach(coId => {
                            coQuestionMap.get(coId)?.push({ q: q.q, maxMarks: q.maxMarks, assessmentId: assessment.id });
                        });
                    });
                });
                
                const studentMarksMap = new Map<string, Map<string, Map<string, number>>>();
                data.marks.filter(m => enrolledStudentIds.has(m.studentId)).forEach(mark => {
                    if (!studentMarksMap.has(mark.studentId)) studentMarksMap.set(mark.studentId, new Map());
                    const assessmentMap = studentMarksMap.get(mark.studentId)!;
                    const scoreMap = new Map<string, number>();
                    mark.scores.forEach(s => scoreMap.set(s.q, s.marks));
                    assessmentMap.set(mark.assessmentId, scoreMap);
                });

                const studentOverallAttainments = studentsInCourse.map(student => {
                    const studentCoAttainments = courseOutcomes.map(co => {
                        const questionsForCo = coQuestionMap.get(co.id) || [];
                        if (questionsForCo.length === 0) return 0;
                        
                        const totalMaxMarks = questionsForCo.reduce((sum, q) => sum + q.maxMarks, 0);
                        const studentAssessmentMarks = studentMarksMap.get(student.id);
                        let totalObtainedMarks = 0;

                        if (studentAssessmentMarks) {
                            totalObtainedMarks = questionsForCo.reduce((sum, q) => {
                                const score = studentAssessmentMarks.get(q.assessmentId)?.get(q.q);
                                return sum + (score || 0);
                            }, 0);
                        }
                        return totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;
                    });
                    
                    const avgAttainment = studentCoAttainments.reduce((sum, att) => sum + att, 0) / studentCoAttainments.length;
                    return isNaN(avgAttainment) ? 0 : avgAttainment;
                });
                
                const totalAvg = studentOverallAttainments.reduce((sum, att) => sum + att, 0) / studentsInCourse.length;
                overallCoAttainment = isNaN(totalAvg) ? 0 : totalAvg;
            }

            // --- Calculate Average Linkage to POs ---
            const averageLinkages: { [poId: string]: number } = {};
            programOutcomes.forEach(po => {
                if (courseOutcomes.length === 0) {
                    averageLinkages[po.id] = 0;
                    return;
                }

                let totalLinkageLevel = 0;
                let linkedCoCount = 0;

                courseOutcomes.forEach(co => {
                    const mapping = data.coPoMapping.find(m => m.courseId === course.id && m.coId === co.id && m.poId === po.id);
                    const level = mapping?.level || 0;
                    totalLinkageLevel += level;
                    if (level > 0) {
                        linkedCoCount++;
                    }
                });

                averageLinkages[po.id] = linkedCoCount > 0 ? totalLinkageLevel / linkedCoCount : 0;
            });
            
            return {
                course,
                overallCoAttainment,
                averageLinkages
            };
        });

    }, [courses, programOutcomes, data]);


    if (courses.length === 0) {
        return null;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Course Contribution to POs</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border border-gray-300 p-2 text-sm font-medium text-gray-500 uppercase">Course</th>
                            <th className="border border-gray-300 p-2 text-sm font-medium text-gray-500 uppercase">Overall CO Attainment</th>
                            {programOutcomes.map(po => (
                                <th key={po.id} className="border border-gray-300 p-2 text-sm font-medium text-gray-500 uppercase" title={po.description}>{po.number} Linkage</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {courseLinkageData.map(({ course, overallCoAttainment, averageLinkages }) => (
                            <tr key={course.id} className="bg-white hover:bg-gray-50">
                                <td className="border border-gray-300 p-2 font-semibold text-gray-700">{course.name} ({course.code})</td>
                                <td className="border border-gray-300 p-2 text-center">
                                    <span className={`font-bold px-2 py-1 rounded-md ${overallCoAttainment >= course.target ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {overallCoAttainment.toFixed(1)}%
                                    </span>
                                </td>
                                {programOutcomes.map(po => (
                                    <td key={po.id} className="border border-gray-300 p-2 text-center text-gray-600">
                                        {averageLinkages[po.id].toFixed(2)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CoursePoLinkageDashboard;