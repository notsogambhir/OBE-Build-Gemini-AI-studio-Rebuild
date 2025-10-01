import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { User, Course } from '../types';
import Modal from './Modal';

interface AssignCoursesModalProps {
    teacher: User;
    onClose: () => void;
}

const AssignCoursesModal: React.FC<AssignCoursesModalProps> = ({ teacher, onClose }) => {
    const { data, setData, currentUser } = useAppContext();
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

    const unassignedCourses = useMemo(() => {
        if (!currentUser?.programId || !data) return [];
        return data.courses.filter(c => c.programId === currentUser.programId && !c.teacherId);
    }, [data?.courses, currentUser]);

    const handleToggleSelection = (courseId: string) => {
        setSelectedCourseIds(prev =>
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };

    const handleAssignCourses = () => {
        // TODO: Replace with API call
        if (!setData) return;
        setData(prev => prev ? ({
            ...prev,
            courses: prev.courses.map(c =>
                selectedCourseIds.includes(c.id) ? { ...c, teacherId: teacher.id } : c
            )
        }) : null);
        onClose();
    };

    return (
        <Modal title={`Assign Courses to ${teacher.name}`} onClose={onClose}>
            <div className="p-6">
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {unassignedCourses.length > 0 ? (
                        unassignedCourses.map(course => (
                            <label key={course.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedCourseIds.includes(course.id)}
                                    onChange={() => handleToggleSelection(course.id)}
                                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="ml-3 text-gray-800 font-medium">{course.code} - {course.name}</span>
                            </label>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">No unassigned courses available in this program.</p>
                    )}
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                    <button
                        type="button"
                        onClick={handleAssignCourses}
                        disabled={selectedCourseIds.length === 0}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        Assign ({selectedCourseIds.length})
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignCoursesModal;
