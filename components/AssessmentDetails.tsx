

import React, { useState, useMemo, useEffect } from 'react';
import { AssessmentQuestion, Mark, MarkScore } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import ExcelUploader from './ExcelUploader';
import { PlusCircle, Trash2, Download, ChevronUp, Edit } from './Icons';

declare const XLSX: any;

interface AssessmentDetailsProps {
  assessmentId: string;
  onBack: () => void;
}

const AssessmentDetails: React.FC<AssessmentDetailsProps> = ({ assessmentId, onBack }) => {
    const { data, setData, currentUser } = useAppContext();
    const canManage = currentUser?.role === 'Teacher' || currentUser?.role === 'Program Co-ordinator';

    const [editingQuestion, setEditingQuestion] = useState<{ q: string; name: string; maxMarks: number} | null>(null);

    const assessment = useMemo(() => data.assessments.find(a => a.id === assessmentId), [data.assessments, assessmentId]);

    const nextQName = useMemo(() => {
        if (!assessment) return 'Q1';
        const highestNum = assessment.questions.reduce((max, q) => {
            const num = parseInt(q.q.replace('Q', ''), 10);
            return !isNaN(num) && num > max ? num : max;
        }, 0);
        return `Q${highestNum + 1}`;
    }, [assessment]);
    
    const [newQName, setNewQName] = useState(nextQName);
    const [newQMaxMarks, setNewQMaxMarks] = useState(10);
    
    useEffect(() => {
        setNewQName(nextQName);
    }, [nextQName]);
    
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

    const handleDownloadTemplate = () => {
        if (!assessment) return;
        const enrolledStudentIds = new Set(
            data.enrollments.filter(e => e.courseId === assessment.courseId).map(e => e.studentId)
        );
        const activeEnrolledStudents = data.students
            .filter(s => s.status === 'Active' && enrolledStudentIds.has(s.id))
            .sort((a, b) => a.name.localeCompare(b.name));
        const questionHeaders = assessment.questions.map(q => q.q).sort((a, b) => {
          const numA = parseInt(a.substring(1));
          const numB = parseInt(b.substring(1));
          return numA - numB;
        });

        const templateData = activeEnrolledStudents.map(student => {
            const studentRow: { [key: string]: string | number } = {
                'Student ID': student.id, 'Student Name': student.name,
            };
            questionHeaders.forEach(header => { studentRow[header] = ''; });
            return studentRow;
        });
        
        if (templateData.length === 0) {
            const headerRow: { [key: string]: string } = { 'Student ID': '', 'Student Name': '' };
            questionHeaders.forEach(header => { headerRow[header] = ''; });
            templateData.push(headerRow);
            alert("No active students are enrolled. A template with only headers will be downloaded.");
        }

        try {
            if (typeof XLSX === 'undefined') {
                alert('Excel library (SheetJS) is not loaded.'); return;
            }
            const worksheet = XLSX.utils.json_to_sheet(templateData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Marks Template');
            const course = data.courses.find(c => c.id === assessment.courseId);
            const fileName = `Marks-Template-${course?.code || 'Course'}-${assessment.name}.xlsx`.replace(/\s+/g, '_');
            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error("Error generating Excel template:", error);
            alert("Failed to generate the Excel template.");
        }
    };

    const handleQuestionsUpload = (uploadedData: { q: string; maxMarks: string | number }[]) => {
      setData(prevData => {
          const updatedAssessments = prevData.assessments.map(a => {
              if (a.id === assessment.id) {
                  const newQuestions: AssessmentQuestion[] = uploadedData
                      .filter(row => row.q && row.maxMarks && !isNaN(Number(row.maxMarks)) && Number(row.maxMarks) > 0)
                      .map(row => ({ q: String(row.q).trim(), maxMarks: Number(row.maxMarks), coIds: [] }));

                  if (newQuestions.length === 0) {
                      alert("No valid questions found. Ensure file has 'q' and 'maxMarks' columns.");
                      return a;
                  }

                  const existingQNames = new Set(a.questions.map(q => q.q.toLowerCase()));
                  const uniqueNewQs = newQuestions.filter(nq => !existingQNames.has(nq.q.toLowerCase()));
                  
                  alert(`${uniqueNewQs.length} new questions added. ${newQuestions.length - uniqueNewQs.length} duplicates ignored.`);
                  return { ...a, questions: [...a.questions, ...uniqueNewQs] };
              }
              return a;
          });
          return { ...prevData, assessments: updatedAssessments };
      });
    };

    const handleMarksUpload = (uploadedData: any[]) => {
      setData(prev => {
          let updatedMarks = [...prev.marks];
          const studentIdsInProgram = new Set(prev.students.filter(s => s.programId === assessment.courseId).map(s => s.id));

          uploadedData.forEach(row => {
              const studentIdKey = Object.keys(row).find(key => key.toLowerCase().includes('id'));
              if (!studentIdKey) return;
              const studentId = String(row[studentIdKey]);
              if (!studentId || !studentIdsInProgram.has(studentId)) return;

              let markEntryIndex = updatedMarks.findIndex(m => m.studentId === studentId && m.assessmentId === assessment.id);
              let studentMarkEntry: Mark;
              if (markEntryIndex === -1) {
                  studentMarkEntry = { studentId, assessmentId: assessment.id, scores: [] };
              } else {
                  studentMarkEntry = { ...updatedMarks[markEntryIndex], scores: [...updatedMarks[markEntryIndex].scores] };
              }

              Object.keys(row).forEach(qName => {
                  if (assessment.questions.some(q => q.q === qName)) {
                      const markValue = row[qName];
                      if (markValue === null || markValue === undefined || String(markValue).trim().toUpperCase() === 'U') {
                          studentMarkEntry.scores = studentMarkEntry.scores.filter(s => s.q !== qName);
                      } else {
                          const score: MarkScore = { q: qName, marks: Number(markValue) };
                          if (isNaN(score.marks)) return;
                          
                          const scoreIndex = studentMarkEntry.scores.findIndex(s => s.q === qName);
                          if (scoreIndex > -1) {
                              studentMarkEntry.scores[scoreIndex] = score;
                          } else {
                              studentMarkEntry.scores.push(score);
                          }
                      }
                  }
              });

              if (markEntryIndex === -1) {
                  updatedMarks.push(studentMarkEntry);
              } else {
                  updatedMarks[markEntryIndex] = studentMarkEntry;
              }
          });
          return { ...prev, marks: updatedMarks };
      });
      alert(`Marks processed for ${uploadedData.length} students.`);
    };

    const handleAddQuestion = () => {
        if (newQMaxMarks <= 0) {
            alert('Max marks must be greater than 0.'); return;
        }
        setData(prev => {
            const newAssessments = prev.assessments.map(a => {
                if (a.id === assessment.id) {
                    if (a.questions.some(q => q.q.toLowerCase() === newQName.trim().toLowerCase())) {
                        alert(`Question "${newQName.trim()}" already exists.`);
                        return a;
                    }
                    const newQuestion: AssessmentQuestion = { q: newQName.trim(), maxMarks: Number(newQMaxMarks), coIds: [] };
                    return { ...a, questions: [...a.questions, newQuestion] };
                }
                return a;
            });
            return { ...prev, assessments: newAssessments };
        });
        setNewQMaxMarks(10);
    };

    const handleRemoveQuestion = (questionNameToDelete: string) => {
        if (!window.confirm(`Are you sure you want to delete "${questionNameToDelete}"? This will also remove all student marks for this question.`)) return;
    
        setData(prevData => {
            // Correctly update assessments by filtering out the deleted question
            const newAssessments = prevData.assessments.map(a => {
                if (a.id === assessmentId) {
                    return { ...a, questions: a.questions.filter(q => q.q !== questionNameToDelete) };
                }
                return a;
            });
    
            // Correctly update marks by filtering out scores related to the deleted question
            // without removing the parent mark object.
            const newMarks = prevData.marks.map(mark => {
                if (mark.assessmentId === assessmentId) {
                    const updatedScores = mark.scores.filter(score => score.q !== questionNameToDelete);
                    return { ...mark, scores: updatedScores };
                }
                return mark;
            });
    
            return { ...prevData, assessments: newAssessments, marks: newMarks };
        });
    };
    
    const handleCoMappingChange = (qName: string, coId: string, isChecked: boolean) => {
      setData(prev => ({
          ...prev,
          assessments: prev.assessments.map(a => 
              a.id === assessment.id ? { ...a, questions: a.questions.map(q => 
                  q.q === qName ? { ...q, coIds: isChecked ? [...q.coIds, coId] : q.coIds.filter(id => id !== coId) } : q
              )} : a
          )
      }));
    };

    const handleEditStart = (q: AssessmentQuestion) => {
      setEditingQuestion({ q: q.q, name: q.q, maxMarks: q.maxMarks });
    };

    const handleEditCancel = () => {
      setEditingQuestion(null);
    };

    const handleEditSave = () => {
      if (!editingQuestion) return;
      const { q: originalQ, name: newName, maxMarks } = editingQuestion;

      if (maxMarks <= 0) {
        alert("Max marks must be greater than 0.");
        return;
      }

      setData(prev => {
        const assessmentsCopy = JSON.parse(JSON.stringify(prev.assessments));
        let marksCopy = JSON.parse(JSON.stringify(prev.marks));

        const assessmentToUpdate = assessmentsCopy.find((a: any) => a.id === assessment.id);
        if (!assessmentToUpdate) return prev;

        const questionToUpdate = assessmentToUpdate.questions.find((q: any) => q.q === originalQ);
        if (!questionToUpdate) return prev;
        
        const isRenaming = newName !== originalQ;
        if (isRenaming && assessmentToUpdate.questions.some((q: any) => q.q.toLowerCase() === newName.toLowerCase())) {
          alert(`Question "${newName}" already exists.`);
          return prev;
        }

        questionToUpdate.q = newName;
        questionToUpdate.maxMarks = maxMarks;

        if (isRenaming) {
          marksCopy = marksCopy.map((mark: Mark) => {
            if (mark.assessmentId === assessment.id) {
              return { ...mark, scores: mark.scores.map(s => s.q === originalQ ? { ...s, q: newName } : s) };
            }
            return mark;
          });
        }
        
        return { ...prev, assessments: assessmentsCopy, marks: marksCopy };
      });

      setEditingQuestion(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Manage: {assessment.name}</h2>
                <button onClick={onBack} className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
                    <ChevronUp className="w-5 h-5 mr-2" />
                    Hide Questions
                </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Upload Student Marks</h3>
                 <div className="flex items-start gap-4">
                    <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Download className="w-5 h-5" /> Download Template
                    </button>
                    <ExcelUploader<any> onFileUpload={handleMarksUpload} label="Upload Marks" format="cols: id, name, Q1, Q2..." />
                </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                 {canManage && (
                    <div className="pb-4 mb-4 border-b border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Bulk Upload Questions</h4>
                        <ExcelUploader<{ q: string; maxMarks: string | number }>
                            onFileUpload={handleQuestionsUpload}
                            label="Upload Questions"
                            format="columns: q, maxMarks"
                        />
                    </div>
                )}
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
                              {editingQuestion?.q === q.q ? (
                                <>
                                  <td className="px-4 py-2"><input type="text" value={editingQuestion.name} onChange={e => setEditingQuestion({...editingQuestion, name: e.target.value})} className="w-full p-2 border rounded-md" /></td>
                                  <td className="px-4 py-2"><input type="number" value={editingQuestion.maxMarks} onChange={e => setEditingQuestion({...editingQuestion, maxMarks: Number(e.target.value)})} className="w-24 p-2 border rounded-md" /></td>
                                  <td colSpan={courseOutcomes.length}></td>
                                  <td className="px-4 py-2 text-right whitespace-nowrap">
                                      <button onClick={handleEditSave} className="text-green-600 font-semibold mr-2">Save</button>
                                      <button onClick={handleEditCancel} className="text-gray-600">Cancel</button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{q.q}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{q.maxMarks}</td>
                                  {courseOutcomes.map(co => (
                                      <td key={co.id} className="px-4 py-2 text-center">
                                          <input type="checkbox" checked={q.coIds.includes(co.id)} onChange={(e) => canManage && handleCoMappingChange(q.q, co.id, e.target.checked)} disabled={!canManage} className="h-4 w-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50" />
                                      </td>
                                  ))}
                                  {canManage && (
                                      <td className="px-4 py-2 text-right">
                                          <button onClick={() => handleEditStart(q)} className="text-indigo-600 hover:text-indigo-800 p-1 mr-1"><Edit className="w-5 h-5" /></button>
                                          <button onClick={() => handleRemoveQuestion(q.q)} className="text-red-600 hover:text-red-800 p-1"><Trash2 className="w-5 h-5" /></button>
                                      </td>
                                  )}
                                </>
                              )}
                            </tr>
                        ))}
                        {canManage && !editingQuestion && (
                            <tr className="bg-gray-50">
                                <td className="px-4 py-2">
                                    <input type="text" value={newQName} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0 focus:border-gray-300" />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="number" value={newQMaxMarks} onChange={e => setNewQMaxMarks(Number(e.target.value))} className="w-24 p-2 border border-gray-300 rounded-md bg-white text-gray-900" />
                                </td>
                                <td colSpan={courseOutcomes.length}></td>
                                <td className="px-4 py-2 text-right">
                                    <button onClick={handleAddQuestion} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"><PlusCircle className="w-5 h-5" /></button>
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