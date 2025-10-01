import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Target, PieChart } from '../components/Icons';
import StatCard from '../components/StatCard';

const Dashboard: React.FC = () => {
    const { data, selectedProgram, currentUser } = useAppContext();
    const navigate = useNavigate();

    const { programCourses, programStudents, programPOs } = useMemo(() => {
        if (!data || !selectedProgram) {
            return { programCourses: [], programStudents: [], programPOs: [] };
        }

        let courses = data.courses.filter(c => c.programId === selectedProgram?.id);
        if (currentUser?.role === 'Teacher') {
            courses = courses.filter(c => c.teacherId === currentUser.id);
        }

        const students = data.students.filter(s => s.programId === selectedProgram?.id);
        const pos = data.programOutcomes.filter(po => po.programId === selectedProgram?.id);

        return { programCourses: courses, programStudents: students, programPOs: pos };
    }, [data, selectedProgram, currentUser]);

    if (!selectedProgram) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-700">Welcome</h1>
                <p className="text-gray-500 mt-2">Please select a program and batch from the sidebar to view the dashboard.</p>
            </div>
        )
    }
  
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={currentUser?.role === 'Teacher' ? "My Assigned Courses" : "Courses in Program"} value={programCourses.length} icon={<BookOpen />} color="blue" />
                <StatCard title="Students in Program" value={programStudents.length} icon={<Users />} color="green" />
                <StatCard title="Program Outcomes" value={programPOs.length} icon={<Target />} color="purple" />
                <StatCard title="Courses to Assess" value={programCourses.length} icon={<PieChart />} color="red" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <button onClick={() => navigate('/courses')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Manage Courses</button>
                    <button onClick={() => navigate('/reports')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">View Reports</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
