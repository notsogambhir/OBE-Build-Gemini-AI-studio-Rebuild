import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { ArrowLeft } from './Icons';

interface AssessmentAttainmentReportProps {
  assessmentId: string;
  onBack: () => void;
}

const AssessmentAttainmentReport: React.FC<AssessmentAttainmentReportProps> = ({ assessmentId, onBack }) => {
    const { data } = useAppContext();

    const assessment = useMemo(() => data?.assessments.find(a => a.id === assessmentId), [assessmentId, data?.assessments]);
    const course = useMemo(() => data?.courses.find(c => c.id === assessment?.courseId), [assessment, data?.courses]);
    const courseOutcomes = useMemo(() => data?.courseOutcomes.filter(co => co.courseId === course?.id) ?? [], [course, data?.courseOutcomes]);

    const studentAttainmentData = useMemo(() => {
        if (!assessment || !course || !data) return [];
        
        const enrolledStudentIds = new Set(data.enrollments.filter(e => e.courseId === course.id).map(e => e.studentId));
        const studentsInCourse = data.students.filter(s => enrolledStudentIds.has(s.id));

        return studentsInCourse.map(student => {
            const attainments: { [coId: string]: number | null } = {};
            
            courseOutcomes.forEach(co => {
                let totalObtainedMarks = 0;
                let totalMaxMarks = 0;

                const questionsForCo = assessment.questions.filter(q => q.coIds.includes(co.id));

                if (questionsForCo.length > 0) {
                    const studentMark = data.marks.find(m => m.studentId === student.id && m.assessmentId === assessment.id);

                    questionsForCo.forEach(question => {
                        totalMaxMarks += question.maxMarks;
                        if (studentMark) {
                            const score = studentMark.scores.find(s => s.q === question.q);
                            if (score) {
                                totalObtainedMarks += score.marks;
                            }
                        }
                    });
                    const percentage = totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;
                    attainments[co.id] = percentage;
                } else {
                    // If no questions in this exam are mapped to this CO, the attainment is not applicable.
                    attainments[co.id] = null;
                }
            });

            return { student, attainments };
        });
    }, [assessment, course, data, courseOutcomes]);

    if (!data) {
        return <div className="text-center p-8">Loading report data...</div>;
    }

    if (!assessment || !course) {
        return <div className="text-center text-red-500">Assessment or Course not found.</div>;
    }

    // Filter out COs that are not assessed in this exam for the table header
    const assessedOutcomes = courseOutcomes.filter(co => 
        assessment.questions.some(q => q.coIds.includes(co.id))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Exam Wise CO Attainment</h1>
                    <p className="text-gray-500">Report for: <strong>{assessment.name}</strong> ({course.name})</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                {assessedOutcomes.map(co => (
                                    <th key={co.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title={co.description}>
                                        {co.number} Attainment %
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {studentAttainmentData.map(({ student, attainments }) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.name}</td>
                                    {assessedOutcomes.map(co => {
                                        const attainmentValue = attainments[co.id];
                                        return (
                                            <td key={co.id} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                {attainmentValue !== null ? (
                                                    <span className={`font-semibold ${attainmentValue >= course.target ? 'text-green-600' : 'text-red-600'}`}>
                                                        {attainmentValue.toFixed(2)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {assessedOutcomes.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No Course Outcomes have been mapped to the questions in this assessment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentAttainmentReport;