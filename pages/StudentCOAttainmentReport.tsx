import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const StudentCOAttainmentReport: React.FC = () => {
    const { courseId } = useParams();
    const { data } = useAppContext();

    const course = useMemo(() => data.courses.find(c => c.id === courseId), [courseId, data.courses]);
    const courseOutcomes = useMemo(() => data.courseOutcomes.filter(co => co.courseId === courseId), [courseId, data.courseOutcomes]);

    const studentAttainmentData = useMemo(() => {
        if (!courseId) return [];
        
        const enrolledStudentIds = new Set(data.enrollments.filter(e => e.courseId === courseId).map(e => e.studentId));
        const studentsInCourse = data.students.filter(s => enrolledStudentIds.has(s.id));

        return studentsInCourse.map(student => {
            const attainments: { [coId: string]: number } = {};
            courseOutcomes.forEach(co => {
                // This logic is still mocked, but now it only applies to enrolled students.
                // A real implementation would calculate this based on marks.
                attainments[co.id] = Math.floor(Math.random() * (100 - 40 + 1) + 40);
            });
            return {
                student,
                attainments,
            };
        });
    }, [courseId, data.enrollments, data.students, courseOutcomes]);

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
                                    <th key={co.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{co.number} Attainment %</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {studentAttainmentData.map(({ student, attainments }) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.name}</td>
                                    {courseOutcomes.map(co => (
                                        <td key={co.id} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className={`font-semibold ${attainments[co.id] >= course.target ? 'text-green-600' : 'text-red-600'}`}>
                                                {attainments[co.id]}%
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentCOAttainmentReport;