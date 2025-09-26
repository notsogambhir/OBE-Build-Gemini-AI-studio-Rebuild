

import React, { useState } from 'react';
import { AssessmentQuestion, StudentMark, Mark, MarkScore } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import ExcelUploader from './ExcelUploader';
import { PlusCircle, Trash2 } from './Icons';

interface AssessmentDetailsProps {
  assessmentId: string;
  onBack: () => void;
}

const AssessmentDetails: React.FC<AssessmentDetailsProps> = ({ assessmentId, onBack }) => {
    const { data, setData, currentUser } = useAppContext();
    const canManage = currentUser?.role === 'Teacher' || currentUser?.role === 'Program Co-ordinator';

    const assessment = data.assessments.find(a => a.id === assessmentId);

    const [newQName, setNewQName] = useState('');
    const [newQMaxMarks, setNewQMaxMarks] = useState(10);
    
    if (!assessment) {
        return (
            <div>
                <p className="text-red-500">Assessment not found.</p>
                <button onClick={onBack} className="mt-4 flex items-center text-indigo-600 hover:text-indigo-800">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Assessments
                </button>
            </div>
        );
    }
    
    const courseOutcomes = data.courseOutcomes.filter(co => co.courseId === assessment.courseId);

    const handleMarksUpload = (uploadedData: any[]) => {
        // FIX: The entire function logic is rewritten to correctly update the global state.
        setData(prev => {
            const newMarksList: Mark[] = [...prev.marks];

            uploadedData.forEach(row => {
                const studentIdKey = Object.keys(row).find(key => key.toLowerCase().includes('id'));
                if (!studentIdKey) return; // Skip row if no student ID found
                
                const studentId = String(row[studentIdKey]);
                if (!studentId) return;

                // Find or create the student's mark entry for this specific assessment
                let studentMarkEntry = newMarksList.find(m => m.studentId === studentId && m.assessmentId === assessment.id);
                if (!studentMarkEntry) {
                    studentMarkEntry = { studentId, assessmentId: assessment.id, scores: [] };
                    newMarksList.push(studentMarkEntry);
                }

                // Update scores for each question column in the row
                Object.keys(row).forEach(questionName => {
                    if (questionName.toLowerCase().includes('id') || questionName.toLowerCase().includes('name')) return;
                    
                    const markValue = row[questionName];
                    if (markValue === null || markValue === undefined || String(markValue).trim().toUpperCase() === 'U') {
                        return; // Ignore empty or 'U' cells
                    }
                    
                    const score: MarkScore = { q: questionName, marks: Number(markValue) };
                    if (isNaN(score.marks)) return; // Ignore non-numeric values

                    const existingScoreIndex = studentMarkEntry.scores.findIndex(s => s.q === score.q);
                    if (existingScoreIndex > -1) {
                        studentMarkEntry.scores[existingScoreIndex] = score;
                    } else {
                        studentMarkEntry.scores.push(score);
                    }
                });
            });

            return { ...prev, marks: newMarksList };
        });

        alert(`Marks processed for ${uploadedData.length} students.`);
    };

    const handleAddQuestion = () => {
        if (!newQName.trim() || newQMaxMarks <= 0) {
            alert('Please provide a valid question name and max marks.');
            return;
        }

        const newQuestion: AssessmentQuestion = {
            q: newQName.trim(),
            maxMarks: Number(newQMaxMarks),
            coIds: [],
        };

        setData(prevData => {
            const updatedAssessments = prevData.assessments.map(a => {
                if (a.id === assessment.id) {
                    if (a.questions.some(q => q.q.toLowerCase() === newQuestion.q.toLowerCase())) {
                        alert(`Question "${newQuestion.q}" already exists in this assessment.`);
                        return a;
                    }
                    return {
                        ...a,
                        questions: [...a.questions, newQuestion],
                    };
                }
                return a;
            });
            return { ...prevData, assessments: updatedAssessments };
        });

        setNewQName('');
        setNewQMaxMarks(10);
    };

    const handleRemoveQuestion = (questionName: string) => {
        if (!window.confirm(`Are you sure you want to delete question "${questionName}"?`)) {
            return;
        }

        setData(prevData => {
            const updatedAssessments = prevData.assessments.map(a => {
                if (a.id === assessment.id) {
                    return {
                        ...a,
                        questions: a.questions.filter(q => q.q !== questionName),
                    };
                }
                return a;
            });
            return { ...prevData, assessments: updatedAssessments };
        });
    };
    
    const handleCoMappingChange = (qName: string, coId: string, isChecked: boolean) => {
        setData(prev => ({
            ...prev,
            assessments: prev.assessments.map(a => {
                if (a.id === assessment.id) {
                    return {
                        ...a,
                        questions: a.questions.map(q => {
                            if (q.q === qName) {
                                const newCoIds = isChecked
                                    ? [...q.coIds, coId]
                                    : q.coIds.filter(id => id !== coId);
                                return { ...q, coIds: newCoIds };
                            }
                            return q;
                        })
                    };
                }
                return a;
            })
        }));
    };

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center text-indigo-600 hover:text-indigo-800">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Assessments
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Manage: {assessment.name}</h2>
            
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Upload Student Marks</h3>
                <ExcelUploader<any> onFileUpload={handleMarksUpload} label="Upload Marks" format="columns: id, name, Q1, Q2..." />
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Manage Questions & CO Mapping</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Max Marks</th>
                            {courseOutcomes.map(co => (
                                <th key={co.id} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{co.number}</th>
                            ))}
                            {canManage && <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {assessment.questions.map(q => (
                            <tr key={q.q}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{q.q}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{q.maxMarks}</td>
                                {courseOutcomes.map(co => (
                                    <td key={co.id} className="px-4 py-2 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={q.coIds.includes(co.id)}
                                            onChange={(e) => canManage && handleCoMappingChange(q.q, co.id, e.target.checked)}
                                            disabled={!canManage}
                                            className="h-4 w-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                                        />
                                    </td>
                                ))}
                                {canManage && (
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => handleRemoveQuestion(q.q)} className="text-red-600 hover:text-red-800 p-1">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {canManage && (
                            <tr className="bg-gray-50">
                                <td className="px-4 py-2">
                                    <input 
                                        type="text"
                                        placeholder="New Question (e.g., Q5)"
                                        value={newQName}
                                        onChange={e => setNewQName(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input 
                                        type="number"
                                        value={newQMaxMarks}
                                        onChange={e => setNewQMaxMarks(Number(e.target.value))}
                                        className="w-24 p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                    />
                                </td>
                                <td colSpan={courseOutcomes.length}></td>
                                <td className="px-4 py-2 text-right">
                                    <button onClick={handleAddQuestion} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700">
                                        <PlusCircle className="w-5 h-5" />
                                    </button>
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

export default AssessmentDetails;