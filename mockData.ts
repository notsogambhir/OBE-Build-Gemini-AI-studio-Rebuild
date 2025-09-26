import { AppData } from './types';

export const initialData: AppData = {
  users: [
    { id: 'U1', username: 'teacher', password: 'password', role: 'Teacher', name: 'Dr. Smith' },
    { id: 'U2', username: 'manager', password: 'password', role: 'Program Co-ordinator', name: 'Ms. Jones' },
    { id: 'U3', username: 'university', password: 'password', role: 'University', name: 'Dean Adams' },
    { id: 'U4', username: 'admin', password: 'password', role: 'Admin', name: 'Admin User' },
  ],
  colleges: [
      { id: 'CUIET', name: 'CUIET' },
      { id: 'CCP', name: 'CCP' },
      { id: 'CBS', name: 'CBS' },
  ],
  programs: [
      { id: 'P1', name: 'BE ME', collegeId: 'CUIET' },
      { id: 'P2', name: 'BE ECE', collegeId: 'CUIET' },
      { id: 'P3', name: 'B. Pharma', collegeId: 'CCP' },
      { id: 'P4', name: 'M. Pharma', collegeId: 'CCP' },
      { id: 'P5', name: 'BBA', collegeId: 'CBS' },
      { id: 'P6', name: 'MBA Global', collegeId: 'CBS' },
      { id: 'P7', name: 'MBA Pharmacy', collegeId: 'CBS'},
  ],
  courses: [
    { id: 'C101', name: 'Introduction to Programming', code: 'CS101', programId: 'P2', status: 'Completed', target: 60, internalWeightage: 40, externalWeightage: 60, attainmentLevels: { level3: 60, level2: 50, level1: 30 } },
    { id: 'C102', name: 'Database Management Systems', code: 'CS203', programId: 'P2', status: 'Active', target: 65, internalWeightage: 50, externalWeightage: 50, attainmentLevels: { level3: 60, level2: 50, level1: 30 } },
    { id: 'C103', name: 'Digital Logic Design', code: 'EC201', programId: 'P2', status: 'Active', target: 60, internalWeightage: 40, externalWeightage: 60, attainmentLevels: { level3: 70, level2: 60, level1: 50 } },
    { id: 'C201', name: 'Thermodynamics', code: 'ME101', programId: 'P1', status: 'Active', target: 55, internalWeightage: 30, externalWeightage: 70, attainmentLevels: { level3: 65, level2: 55, level1: 45 } },
    { id: 'C202', name: 'Fluid Mechanics', code: 'ME202', programId: 'P1', status: 'Future', target: 60, internalWeightage: 40, externalWeightage: 60, attainmentLevels: { level3: 60, level2: 50, level1: 40 } },
    { id: 'C301', name: 'Pharmaceutical Chemistry', code: 'BP101', programId: 'P3', status: 'Completed', target: 70, internalWeightage: 50, externalWeightage: 50, attainmentLevels: { level3: 75, level2: 65, level1: 55 } },
  ],
  students: [
    { id: 'S001', name: 'Alice Johnson', programId: 'P2', status: 'Active' },
    { id: 'S002', name: 'Bob Williams', programId: 'P2', status: 'Active' },
    { id: 'S003', name: 'Charlie Brown', programId: 'P2', status: 'Active' },
    { id: 'S004', name: 'Diana Miller', programId: 'P2', status: 'Active' },
    { id: 'S005', name: 'Eve Davis', programId: 'P2', status: 'Inactive' },
    { id: 'S006', name: 'Frank White', programId: 'P2', status: 'Active' },
    { id: 'S007', name: 'Grace Lee', programId: 'P2', status: 'Active' },
    { id: 'S008', name: 'Henry Taylor', programId: 'P1', status: 'Active' },
    { id: 'S009', name: 'Ivy Green', programId: 'P1', status: 'Active' },
    { id: 'S010', name: 'Jack Black', programId: 'P1', status: 'Inactive' },
    { id: 'S011', name: 'Kate Hudson', programId: 'P3', status: 'Active' },
    { id: 'S012', name: 'Liam Neeson', programId: 'P3', status: 'Active' },
  ],
   enrollments: [
    { courseId: 'C101', studentId: 'S001' },
    { courseId: 'C101', studentId: 'S002' },
    { courseId: 'C101', studentId: 'S003' },
    { courseId: 'C101', studentId: 'S004' },
    { courseId: 'C101', studentId: 'S005' },
    // C102 and C103 were Future, now Active, so they will be auto-enrolled with active P2 students
    // C201 is active, so it will be auto-enrolled with active P1 students
  ],
  courseOutcomes: [
    { id: 'CO1', courseId: 'C101', number: 'CO1', description: 'Understand basic programming concepts.' },
    { id: 'CO2', courseId: 'C101', number: 'CO2', description: 'Apply control structures to solve problems.' },
    { id: 'CO3', courseId: 'C101', number: 'CO3', description: 'Use functions to create modular code.' },
    { id: 'CO4', courseId: 'C102', number: 'CO1', description: 'Understand relational database concepts.' },
    { id: 'CO5', courseId: 'C102', number: 'CO2', description: 'Write complex SQL queries.' },
    { id: 'CO6', courseId: 'C103', number: 'CO1', description: 'Understand number systems and logic gates.' },
    { id: 'CO7', courseId: 'C103', number: 'CO2', description: 'Design combinational logic circuits.' },
  ],
  programOutcomes: [
    { id: 'PO1', number: 'PO1', description: 'Engineering knowledge', programId: 'P2' },
    { id: 'PO2', number: 'PO2', description: 'Problem analysis', programId: 'P2' },
    { id: 'PO3', number: 'PO3', description: 'Design/development of solutions', programId: 'P2' },
    { id: 'PO4', number: 'PO4', description: 'Conduct investigations of complex problems', programId: 'P2' },
    { id: 'PO5', number: 'PO1', description: 'Mechanical Engineering principles', programId: 'P1' },
    { id: 'PO6', number: 'PO2', description: 'Modern tool usage', programId: 'P1' },
  ],
  coPoMapping: [
    { courseId: 'C101', coId: 'CO1', poId: 'PO1', level: 3 },
    { courseId: 'C101', coId: 'CO1', poId: 'PO2', level: 1 },
    { courseId: 'C101', coId: 'CO2', poId: 'PO2', level: 2 },
    { courseId: 'C101', coId: 'CO2', poId: 'PO3', level: 3 },
    // FIX: Changed 'id' property to 'courseId' to match the CoPoMapping type.
    { courseId: 'C101', coId: 'CO3', poId: 'PO3', level: 3 },
    // FIX: Changed 'id' property to 'courseId' to match the CoPoMapping type.
    { courseId: 'C102', coId: 'CO4', poId: 'PO1', level: 3 },
    // FIX: Changed 'id' property to 'courseId' to match the CoPoMapping type.
    { courseId: 'C102', coId: 'CO5', poId: 'PO2', level: 2 },
    // FIX: Changed 'id' property to 'courseId' to match the CoPoMapping type.
    { courseId: 'C102', coId: 'CO5', poId: 'PO4', level: 3 },
    // FIX: Changed 'id' property to 'courseId' to match the CoPoMapping type.
    { courseId: 'C103', coId: 'CO6', poId: 'PO1', level: 3 },
    // FIX: Changed 'id' property to 'courseId' to match the CoPoMapping type.
    { courseId: 'C103', coId: 'CO7', poId: 'PO3', level: 2 },
  ],
  assessments: [
    { id: 'A1', courseId: 'C101', name: 'Sessional Test 1 (ST1)', type: 'Internal', questions: [{ q: 'Q1', coIds: ['CO1'], maxMarks: 20 }, { q: 'Q2', coIds: ['CO2'], maxMarks: 20 }] },
    { id: 'A2', courseId: 'C101', name: 'Assignments', type: 'Internal', questions: [{ q: 'Q1', coIds: ['CO3'], maxMarks: 10 }] },
    { id: 'A3', courseId: 'C101', name: 'External Examination (ETE)', type: 'External', questions: [{ q: 'Q1', coIds: ['CO1'], maxMarks: 25 }, { q: 'Q2', coIds: ['CO2'], maxMarks: 25 }, { q: 'Q3', coIds: ['CO3','CO1'], maxMarks: 25 }] },
    { id: 'A4', courseId: 'C102', name: 'Mid Term Exam', type: 'Internal', questions: [{ q: 'Q1', coIds: ['CO4'], maxMarks: 50 }] },
  ],
  marks: [
    // C101 Marks
    { studentId: 'S001', assessmentId: 'A1', scores: [{ q: 'Q1', marks: 18 }, { q: 'Q2', marks: 15 }] },
    { studentId: 'S001', assessmentId: 'A2', scores: [{ q: 'Q1', marks: 8 }] },
    { studentId: 'S001', assessmentId: 'A3', scores: [{ q: 'Q1', marks: 20 }, { q: 'Q2', marks: 22 }, { q: 'Q3', marks: 19 }] },
    { studentId: 'S002', assessmentId: 'A1', scores: [{ q: 'Q1', marks: 12 }, { q: 'Q2', marks: 10 }] },
    { studentId: 'S002', assessmentId: 'A2', scores: [{ q: 'Q1', marks: 5 }] },
    { studentId: 'S002', assessmentId: 'A3', scores: [{ q: 'Q1', marks: 15 }, { q: 'Q2', marks: 18 }, { q: 'Q3', marks: 14 }] },
    // C102 Marks
    { studentId: 'S003', assessmentId: 'A4', scores: [{ q: 'Q1', marks: 45 }] },
    { studentId: 'S004', assessmentId: 'A4', scores: [{ q: 'Q1', marks: 30 }] },
  ],
};