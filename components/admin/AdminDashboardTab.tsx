import React, { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import StatCard from '../StatCard';
import { BookOpen, Users, GraduationCap } from '../Icons';

const AdminDashboardTab: React.FC = () => {
  const { data, selectedProgram, selectedCollegeId, selectedBatch } = useAppContext();

  const { totalPrograms, totalUsers, activeStudents } = useMemo(() => {
    let programs = data.programs;
    let users = data.users;
    let students = data.students;

    if (selectedCollegeId) {
      programs = programs.filter(p => p.collegeId === selectedCollegeId);
      const programIdsInCollege = new Set(programs.map(p => p.id));
      
      const deptHead = data.users.find(u => u.role === 'Department' && u.collegeId === selectedCollegeId);
      const pcsInCollege = data.users.filter(u => u.role === 'Program Co-ordinator' && deptHead && u.departmentId === deptHead.id);
      const pcIdsInCollege = new Set(pcsInCollege.map(pc => pc.id));
      const teachersInCollege = data.users.filter(u => u.role === 'Teacher' && u.programCoordinatorIds?.some(id => pcIdsInCollege.has(id)));
      
      users = [deptHead, ...pcsInCollege, ...teachersInCollege].filter(Boolean) as any;
      students = students.filter(s => programIdsInCollege.has(s.programId));
    }
    
    if (selectedProgram) {
        students = students.filter(s => s.programId === selectedProgram.id);
    }
    
    if (selectedBatch && selectedProgram) {
        const sectionsForBatch = data.sections.filter(s => s.programId === selectedProgram.id && s.batch === selectedBatch);
        const sectionIds = new Set(sectionsForBatch.map(s => s.id));
        students = students.filter(s => s.sectionId && sectionIds.has(s.sectionId));
    }

    return {
      totalPrograms: programs.length,
      totalUsers: users.length,
      activeStudents: students.filter(s => s.status === 'Active').length
    };

  }, [data, selectedProgram, selectedCollegeId, selectedBatch]);

  const getContextDescription = () => {
    if (selectedProgram) return `Showing stats for ${selectedProgram.name}`;
    if (selectedCollegeId) {
        const college = data.colleges.find(c => c.id === selectedCollegeId);
        return `Showing stats for ${college?.name}`;
    }
    return "Showing system-wide statistics";
  };


  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-xl font-semibold text-gray-700">System Overview</h2>
            <p className="text-gray-500">{getContextDescription()}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Programs" value={totalPrograms} icon={<BookOpen />} color="blue" />
            <StatCard title="Total Users" value={totalUsers} icon={<Users />} color="purple" />
            <StatCard title="Active Students" value={activeStudents} icon={<GraduationCap />} color="green" />
        </div>
    </div>
  );
};

export default AdminDashboardTab;
