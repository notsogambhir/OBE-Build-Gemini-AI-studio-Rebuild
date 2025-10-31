<<<<<<< HEAD
/**
 * @file StudentCOAttainmentReport.tsx
 * @description
 * This component calculates and displays a detailed report of each student's attainment
 * for every Course Outcome (CO) in a specific course.
 *
 * It has two modes:
 * 1.  **Standalone Page**: When navigated to directly (e.g., from `CourseDetail`), it acts
 *     as a full page with a header, filters, and a print button.
 * 2.  **Embedded Report**: When used inside the `PrintableReport` component (from the main
 *     `AttainmentReports` dashboard), it accepts an `isPrintable` prop and renders a simplified,
 *     print-optimized table without any extra UI.
 */

import React, { useMemo, useState } from 'react';
// FIX: Changed react-router-dom import to namespace import to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
=======
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)
import { useAppContext } from '../hooks/useAppContext';

const StudentCOAttainmentReport: React.FC = () => {
    const { courseId } = useParams();
    const { data } = useAppContext();

<<<<<<< HEAD
const StudentCOAttainmentReport: React.FC<StudentCOAttainmentReportProps> = ({ courseId: propCourseId, isPrintable = false }) => {
    // Get the courseId from the URL if it's not passed as a prop.
    const { courseId: paramCourseId } = ReactRouterDOM.useParams<{ courseId: string }>();
    const courseId = propCourseId || paramCourseId;
=======
    const course = useMemo(() => data.courses.find(c => c.id === courseId), [courseId, data.courses]);
    const courseOutcomes = useMemo(() => data.courseOutcomes.filter(co => co.courseId === courseId).sort((a, b) => a.number.localeCompare(b.number)), [courseId, data.courseOutcomes]);
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)

    const studentAttainmentData = useMemo(() => {
        if (!courseId || !courseOutcomes || courseOutcomes.length === 0) return [];

        // Get all data related to the course first
        // FIX: Assessments are linked to sections, not directly to courses. This logic finds all assessments for a course via its sections from enrollments.
        const sectionIdsForCourse = new Set(data.enrollments.filter(e => e.courseId === courseId && e.sectionId).map(e => e.sectionId!));
        const assessmentsForCourse = data.assessments.filter(a => sectionIdsForCourse.has(a.sectionId));
        const enrolledStudentIds = new Set(data.enrollments.filter(e => e.courseId === courseId).map(e => e.studentId));
        const studentsInCourse = data.students.filter(s => enrolledStudentIds.has(s.id));
        
        // Create a map for faster mark lookups: studentId -> assessmentId -> {scoreMap}
        const studentMarksMap = new Map<string, Map<string, Map<string, number>>>();
        data.marks
            .filter(m => enrolledStudentIds.has(m.studentId))
            .forEach(mark => {
                if (!studentMarksMap.has(mark.studentId)) {
                    studentMarksMap.set(mark.studentId, new Map());
                }
                const assessmentMap = studentMarksMap.get(mark.studentId)!;
                const scoreMap = new Map<string, number>();
                mark.scores.forEach(s => scoreMap.set(s.q, s.marks));
                assessmentMap.set(mark.assessmentId, scoreMap);
            });
            
        // Create a map for faster CO question lookups: coId -> { qName, maxMarks, assessmentId }[]
        const coQuestionMap = new Map<string, { q: string; maxMarks: number; assessmentId: string }[]>();
        courseOutcomes.forEach(co => coQuestionMap.set(co.id, []));

        assessmentsForCourse.forEach(assessment => {
            assessment.questions.forEach(q => {
                q.coIds.forEach(coId => {
                    if (coQuestionMap.has(coId)) {
                        coQuestionMap.get(coId)!.push({ q: q.q, maxMarks: q.maxMarks, assessmentId: assessment.id });
                    }
                });
            });
        });

        return studentsInCourse.map(student => {
            const attainments: { [coId: string]: number } = {};

            courseOutcomes.forEach(co => {
                const questionsForCo = coQuestionMap.get(co.id) || [];
                if (questionsForCo.length === 0) {
                    attainments[co.id] = 0;
                    return;
                }

                const totalMaxMarks = questionsForCo.reduce((sum, q) => sum + q.maxMarks, 0);
                let totalObtainedMarks = 0;
                
                const studentAssessmentMarks = studentMarksMap.get(student.id);

                if (studentAssessmentMarks) {
                    totalObtainedMarks = questionsForCo.reduce((sum, q) => {
                        const score = studentAssessmentMarks.get(q.assessmentId)?.get(q.q);
                        return sum + (score || 0);
                    }, 0);
                }
                
                attainments[co.id] = totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;
            });

            const coAttainmentValues = Object.values(attainments);
            const overallAttainment = coAttainmentValues.length > 0 
                ? coAttainmentValues.reduce((sum, val) => sum + val, 0) / coAttainmentValues.length 
                : 0;

            return { student, attainments, overallAttainment };
        }).sort((a,b) => a.student.id.localeCompare(b.student.id));

    }, [courseId, data, courseOutcomes]);

    if (!course) {
        return <div className="text-center text-red-500">Course not found.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Student CO Attainment Report</h1>
            <p className="text-gray-500">Course: {course.name} ({course.code})</p>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                {courseOutcomes.map(co => (
                                    <th key={co.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title={co.description}>{co.number} Attainment %</th>
                                ))}
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Attainment %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {studentAttainmentData.map(({ student, attainments, overallAttainment }) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.name}</td>
                                    {courseOutcomes.map(co => (
                                        <td key={co.id} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className={`font-semibold ${attainments[co.id] >= course.target ? 'text-green-600' : 'text-red-600'}`}>
                                                {attainments[co.id].toFixed(0)}%
                                            </span>
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className={`font-bold px-2 py-1 rounded-md ${overallAttainment >= course.target ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {overallAttainment.toFixed(0)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {studentAttainmentData.length === 0 && (
                                <tr>
                                    <td colSpan={courseOutcomes.length + 3} className="text-center py-8 text-gray-500">
                                        No student data available to generate the report.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentCOAttainmentReport;