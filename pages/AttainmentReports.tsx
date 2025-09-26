import React, { useMemo, useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { useAppContext } from '../hooks/useAppContext';

const AttainmentReports: React.FC = () => {
    const { data, selectedProgram } = useAppContext();
    
    const attainmentData = useMemo(() => {
        if (!selectedProgram) return null;

        const allCoFinalScores: { [coId: string]: { finalScore: number; percentage: number } } = {};
        const coursesInProgram = data.courses.filter(c => c.programId === selectedProgram.id);

        coursesInProgram.forEach(course => {
            const enrolledStudentIds = new Set(data.enrollments.filter(e => e.courseId === course.id).map(e => e.studentId));
            const studentsInCourse = data.students.filter(s => enrolledStudentIds.has(s.id));
            const cosForThisCourse = data.courseOutcomes.filter(co => co.courseId === course.id);
            
            // FIX: Add a robust guard to handle courses with no valid students, preventing division-by-zero errors.
            if (studentsInCourse.length === 0) {
                cosForThisCourse.forEach(co => {
                    allCoFinalScores[co.id] = { finalScore: 0, percentage: 0 };
                });
                return; // Continue to the next course
            }

            const assessmentsForThisCourse = data.assessments.filter(a => a.courseId === course.id);
            const {level3, level2, level1} = course.attainmentLevels;

            cosForThisCourse.forEach(co => {
                let totalMarksObtainedByStudents: { [studentId: string]: number } = {};
                let totalMaxMarksForCo = 0;

                assessmentsForThisCourse.forEach(assessment => {
                    assessment.questions.forEach(q => {
                        if (q.coIds.includes(co.id)) {
                            totalMaxMarksForCo += q.maxMarks;
                            const studentMarks = data.marks.filter(m => m.assessmentId === assessment.id);
                            studentMarks.forEach(sm => {
                                if (enrolledStudentIds.has(sm.studentId)) {
                                    const score = sm.scores.find(s => s.q === q.q);
                                    if (score) {
                                        totalMarksObtainedByStudents[sm.studentId] = (totalMarksObtainedByStudents[sm.studentId] || 0) + score.marks;
                                    }
                                }
                            });
                        }
                    });
                });
                
                if (totalMaxMarksForCo === 0) {
                    allCoFinalScores[co.id] = { finalScore: 0, percentage: 0 };
                    return;
                }

                const studentsMeetingTarget = studentsInCourse.filter(student => {
                    const marks = totalMarksObtainedByStudents[student.id] || 0;
                    const percentage = (marks / totalMaxMarksForCo) * 100;
                    return percentage >= course.target;
                });
                
                const attainmentPercentage = (studentsMeetingTarget.length / studentsInCourse.length) * 100;
                
                let directScore = 0;
                if (attainmentPercentage >= level3) directScore = 3;
                else if (attainmentPercentage >= level2) directScore = 2;
                else if (attainmentPercentage >= level1) directScore = 1;
                
                const indirectScore = 2.5; // Simulated survey score
                const finalCoScore = (0.9 * directScore) + (0.1 * indirectScore);
                allCoFinalScores[co.id] = { finalScore: finalCoScore, percentage: attainmentPercentage };
            });
        });

        const pos = data.programOutcomes.filter(p => p.programId === selectedProgram.id);
        const finalPoScores: { [poId: string]: number } = {};

        pos.forEach(po => {
            let weightedSum = 0;
            let totalWeight = 0;
            const allMappingsForPo = data.coPoMapping.filter(m => m.poId === po.id);

            allMappingsForPo.forEach(mapping => {
                const courseOfMapping = data.courses.find(c => c.id === mapping.courseId);
                if (courseOfMapping && courseOfMapping.programId === selectedProgram.id) {
                    const coData = allCoFinalScores[mapping.coId];
                    if (coData) {
                        weightedSum += coData.finalScore * mapping.level;
                        totalWeight += mapping.level;
                    }
                }
            });

            const directPoScore = totalWeight > 0 ? (weightedSum / totalWeight) : 0;
            const indirectPoScore = 2.4; // Simulated program exit survey
            const finalPoScore = (0.9 * directPoScore) + (0.1 * indirectPoScore);
            finalPoScores[po.id] = finalPoScore;
        });

        return { programPOs: pos, finalPoScores, allCoFinalScores, coursesInProgram };
    }, [data, selectedProgram]);

    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    
    useEffect(() => {
        // Safely set the initial course ID once data is available
        if (attainmentData?.coursesInProgram && attainmentData.coursesInProgram.length > 0) {
            // Only set if it hasn't been set or if the available courses change
            if (!selectedCourseId || !attainmentData.coursesInProgram.find(c => c.id === selectedCourseId)) {
               setSelectedCourseId(attainmentData.coursesInProgram[0].id);
            }
        }
    }, [attainmentData, selectedCourseId]);

    const selectedCourseReportData = useMemo(() => {
        if(!selectedCourseId || !attainmentData) return null;
        const course = attainmentData.coursesInProgram.find(c => c.id === selectedCourseId);
        if (!course) return null;

        const cos = data.courseOutcomes.filter(co => co.courseId === selectedCourseId);
        const coScores = cos.map(co => ({...co, ...(attainmentData.allCoFinalScores[co.id] || { finalScore: 0, percentage: 0 })}));

        return { course, cos: coScores };
    }, [selectedCourseId, attainmentData, data.courseOutcomes]);

    const coChartData = useMemo(() => ({
        labels: selectedCourseReportData?.cos.map(co => co.number) || [],
        datasets: [{
            label: 'CO Attainment Score (0-3)',
            data: selectedCourseReportData?.cos.map(co => co.finalScore) || [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
        }],
    }), [selectedCourseReportData]);
    
    const poChartData = useMemo(() => ({
        labels: attainmentData?.programPOs.map(po => po.number) || [],
        datasets: [{
            label: 'Final PO Attainment Score (0-3)',
            data: attainmentData?.programPOs.map(po => attainmentData.finalPoScores[po.id] || 0) || [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }],
    }), [attainmentData]);
    
    if (!selectedProgram || !attainmentData) {
        return <div className="text-center p-4">Loading report data...</div>
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
                 <h2 className="text-2xl font-semibold text-gray-700 mb-4">Program Outcome (PO) Attainment for {selectedProgram.name}</h2>
                 <div className="h-96">
                    <Bar options={{ responsive: true, maintainAspectRatio: false, scales: {y: { beginAtZero: true, max: 3 }}, plugins: { title: { display: true, text: 'Final PO Attainment Scores' } } }} data={poChartData} />
                 </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                 <h2 className="text-2xl font-semibold text-gray-700 mb-4">Course-wise Attainment</h2>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                     <div>
                        <label htmlFor="course-select" className="block text-sm font-medium text-gray-700">Select Course to View Details</label>
                        <select
                            id="course-select"
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                             <option value="" disabled>Select a course</option>
                            {attainmentData?.coursesInProgram.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {selectedCourseReportData && selectedCourseReportData.course ? (
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 my-4">Course Outcome (CO) Attainment for {selectedCourseReportData.course.name}</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="p-3 font-medium text-gray-600">CO</th>
                                            <th className="p-3 font-medium text-gray-600">Attainment %</th>
                                            <th className="p-3 font-medium text-gray-600">Final Score (0-3)</th>
                                            <th className="p-3 font-medium text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedCourseReportData.cos.map(co => {
                                            const attainmentLevelForScore = (co.percentage / 100) * 3;
                                            const targetScore = (selectedCourseReportData.course.target / 100) * 3;
                                            const isMet = attainmentLevelForScore >= targetScore;
                                            return (
                                                <tr key={co.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 font-semibold">{co.number}</td>
                                                    <td className="p-3">{co.percentage.toFixed(2)}%</td>
                                                    <td className="p-3">{co.finalScore.toFixed(2)}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isMet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {isMet ? 'Target Met' : 'Target Not Met'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="h-80">
                               <Bar options={{ responsive: true, maintainAspectRatio: false, scales: {y: { beginAtZero: true, max: 3 }}, plugins: { title: { display: true, text: `Final CO Attainment Scores` } } }} data={coChartData} />
                            </div>
                        </div>
                    </div>
                ) : <p className="text-center text-gray-500 py-8">Select a course to view its report or add courses/students to this program.</p>}
            </div>
        </div>
    );
};

export default AttainmentReports;