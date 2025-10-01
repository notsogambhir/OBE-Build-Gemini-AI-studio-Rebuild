import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import AssessmentAttainmentReport from '../components/AssessmentAttainmentReport';

const AssessmentReportsList: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { data } = useAppContext();
    const [viewingReportForAssessmentId, setViewingReportForAssessmentId] = useState<string | null>(null);

    const course = useMemo(() => data?.courses.find(c => c.id === courseId), [courseId, data?.courses]);
    const assessments = useMemo(() => data?.assessments.filter(a => a.courseId === courseId) ?? [], [courseId, data?.assessments]);

    if (!data) return <div>Loading reports...</div>;

    if (viewingReportForAssessmentId) {
        return <AssessmentAttainmentReport assessmentId={viewingReportForAssessmentId} onBack={() => setViewingReportForAssessmentId(null)} />;
    }

    if (!course) return <div className="text-red-500">Course not found.</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700">Assessment Reports</h2>
            <p className="text-sm text-gray-500">Select an assessment to view its detailed CO attainment report.</p>
            <div className="space-y-4">
                {assessments.map(assessment => {
                    const totalMaxMarks = assessment.questions.reduce((sum, q) => sum + q.maxMarks, 0);
                    const hasMarks = data.marks.some(m => m.assessmentId === assessment.id);
                    return (
                        <div key={assessment.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
                            <div>
                                <p className="font-semibold text-gray-800 flex items-center">
                                    {assessment.name}
                                    {hasMarks && (
                                        <span className="ml-2 text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                            ✓ Marks Uploaded
                                        </span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-500">{assessment.type} | Max Marks: {totalMaxMarks}</p>
                            </div>
                            <div className="space-x-4">
                                <button
                                    onClick={() => setViewingReportForAssessmentId(assessment.id)}
                                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                    disabled={!hasMarks}
                                >
                                    View Report
                                </button>
                            </div>
                        </div>
                    )
                })}
                {assessments.length === 0 && <p className="text-gray-500 text-center py-4">No assessments found for this course.</p>}
            </div>
        </div>
    );
};

export default AssessmentReportsList;
