



import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
// FIX: Use context instead of non-existent MOCK data.
import { useAppContext } from '../hooks/useAppContext';

const StudentCOAttainmentReport: React.FC = () => {
    const { courseId } = useParams();
    // FIX: Get data from context.
    const { data } = useAppContext();

    // FIX: Get course from context data.
    const course = useMemo(() => data.courses.find(c => c.id === courseId), [courseId, data.courses]);
    // FIX: Get course outcomes from context data.
    const courseOutcomes = useMemo(() => data.courseOutcomes.filter(co => co.courseId === courseId), [courseId, data.courseOutcomes]);

    // Mock data for student attainment. In a real app, this would be calculated.
    const studentAttainmentData = useMemo(() => {
        // FIX: Use students from context data.
        return data.students.map(student => {
            const attainments: { [coId: string]: number } = {};
            courseOutcomes.forEach(co => {
                attainments[co.id] = Math.floor(Math.random() * (100 - 40 + 1) + 40);
            });
            return {
                student,
                attainments,
            };
        });
    }, [courseOutcomes, data.students]);

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
                                    // FIX: Use 'co.number' instead of 'co.code'.
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
                                            {/* FIX: Use 'course.target' instead of 'course.targetAttainment'. */}
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