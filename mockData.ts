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
    // BE ECE Program (P2)
    { id: 'C101', name: 'Introduction to Programming', code: 'CS101', programId: 'P2', status: 'Completed', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C102', name: 'Database Management Systems', code: 'CS203', programId: 'P2', status: 'Active', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C103', name: 'Digital Logic Design', code: 'EC201', programId: 'P2', status: 'Active', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C104', name: 'Network Analysis & Synthesis', code: 'EC202', programId: 'P2', status: 'Active', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C105', name: 'Electromagnetic Field Theory', code: 'EC203', programId: 'P2', status: 'Active', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C106', name: 'Analog Electronics', code: 'EC204', programId: 'P2', status: 'Active', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C107', name: 'Signals and Systems', code: 'EC301', programId: 'P2', status: 'Active', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C108', name: 'Control Systems', code: 'EC302', programId: 'P2', status: 'Active', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C109', name: 'Microprocessors & Microcontrollers', code: 'EC303', programId: 'P2', status: 'Active', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C110', name: 'Digital Communication', code: 'EC304', programId: 'P2', status: 'Active', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C111', name: 'VLSI Design', code: 'EC401', programId: 'P2', status: 'Active', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    
    { id: 'C112', name: 'Data Structures', code: 'CS201', programId: 'P2', status: 'Future', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C113', name: 'Operating Systems', code: 'CS301', programId: 'P2', status: 'Future', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C114', name: 'Computer Networks', code: 'CS302', programId: 'P2', status: 'Future', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C115', name: 'Microwave Engineering', code: 'EC402', programId: 'P2', status: 'Future', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C116', name: 'Information Theory and Coding', code: 'EC403', programId: 'P2', status: 'Future', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C117', name: 'Embedded Systems', code: 'EC404', programId: 'P2', status: 'Future', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C118', name: 'Wireless Communication', code: 'EC405', programId: 'P2', status: 'Future', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C119', name: 'Satellite Communication', code: 'EC406', programId: 'P2', status: 'Future', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },

    { id: 'C120', name: 'Physics of Semiconductor Devices', code: 'AP101', programId: 'P2', status: 'Completed', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C121', name: 'Engineering Mathematics I', code: 'AM101', programId: 'P2', status: 'Completed', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C122', name: 'Engineering Mathematics II', code: 'AM102', programId: 'P2', status: 'Completed', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C123', name: 'Basic Electrical Engineering', code: 'EE101', programId: 'P2', status: 'Completed', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C124', name: 'Communication Skills', code: 'HU101', programId: 'P2', status: 'Completed', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C125', name: 'Environmental Science', code: 'CH101', programId: 'P2', status: 'Completed', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C126', name: 'Analog Electronic Circuits', code: 'EC205', programId: 'P2', status: 'Completed', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C127', name: 'Digital Signal Processing', code: 'EC305', programId: 'P2', status: 'Completed', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C128', name: 'Antenna and Wave Propagation', code: 'EC306', programId: 'P2', status: 'Completed', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C129', name: 'Project Management', code: 'HU401', programId: 'P2', status: 'Completed', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    
    // Other Programs
    { id: 'C201', name: 'Thermodynamics', code: 'ME101', programId: 'P1', status: 'Active', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C202', name: 'Fluid Mechanics', code: 'ME202', programId: 'P1', status: 'Future', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C301', name: 'Pharmaceutical Chemistry', code: 'BP101', programId: 'P3', status: 'Completed', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
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
    // Completed P2 courses enrollments
    { courseId: 'C101', studentId: 'S001' }, { courseId: 'C101', studentId: 'S002' }, { courseId: 'C101', studentId: 'S003' }, { courseId: 'C101', studentId: 'S004' }, { courseId: 'C101', studentId: 'S005' },
    { courseId: 'C120', studentId: 'S001' }, { courseId: 'C120', studentId: 'S002' }, { courseId: 'C120', studentId: 'S003' },
    { courseId: 'C121', studentId: 'S001' }, { courseId: 'C121', studentId: 'S002' }, { courseId: 'C121', studentId: 'S003' }, { courseId: 'C121', studentId: 'S004' },
    { courseId: 'C123', studentId: 'S001' }, { courseId: 'C123', studentId: 'S002' }, { courseId: 'C123', studentId: 'S003' },
    { courseId: 'C127', studentId: 'S001' }, { courseId: 'C127', studentId: 'S002' },
    
    // Enroll all active students in P2 into all active courses for P2
    ...['S001', 'S002', 'S003', 'S004', 'S006', 'S007'].flatMap(studentId => 
      ['C102', 'C103', 'C104', 'C105', 'C106', 'C107', 'C108', 'C109', 'C110', 'C111'].map(courseId => ({ courseId, studentId }))
    ),
    
    // Enroll all active students in P1 into all active courses for P1
    ...['S008', 'S009'].flatMap(studentId => ['C201'].map(courseId => ({ courseId, studentId }))),
  ],
  courseOutcomes: [
    { id: 'CO1', courseId: 'C101', number: 'CO1', description: 'Understand basic programming concepts.' },
    { id: 'CO2', courseId: 'C101', number: 'CO2', description: 'Apply control structures to solve problems.' },
    { id: 'CO3', courseId: 'C101', number: 'CO3', description: 'Use functions to create modular code.' },
    { id: 'CO4', courseId: 'C102', number: 'CO1', description: 'Understand relational database concepts.' },
    { id: 'CO5', courseId: 'C102', number: 'CO2', description: 'Write complex SQL queries.' },
    { id: 'CO6', courseId: 'C103', number: 'CO1', description: 'Understand number systems and logic gates.' },
    { id: 'CO7', courseId: 'C103', number: 'CO2', description: 'Design combinational logic circuits.' },
    { id: 'CO8', courseId: 'C104', number: 'CO1', description: 'Apply network theorems to solve complex circuits.' },
    { id: 'CO9', courseId: 'C127', number: 'CO1', description: 'Analyze discrete-time signals in time and frequency domain.'},
    { id: 'CO10', courseId: 'C127', number: 'CO2', description: 'Design and implement digital filters.'},
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
    { courseId: 'C101', coId: 'CO3', poId: 'PO3', level: 3 },
    { courseId: 'C102', coId: 'CO4', poId: 'PO1', level: 3 },
    { courseId: 'C102', coId: 'CO5', poId: 'PO2', level: 2 },
    { courseId: 'C102', coId: 'CO5', poId: 'PO4', level: 3 },
    { courseId: 'C103', coId: 'CO6', poId: 'PO1', level: 3 },
    { courseId: 'C103', coId: 'CO7', poId: 'PO3', level: 2 },
    { courseId: 'C104', coId: 'CO8', poId: 'PO1', level: 2 },
    { courseId: 'C104', coId: 'CO8', poId: 'PO2', level: 3 },
    { courseId: 'C127', coId: 'CO9', poId: 'PO2', level: 3 },
    { courseId: 'C127', coId: 'CO10', poId: 'PO3', level: 2 },
  ],
  assessments: [
    { id: 'A1', courseId: 'C101', name: 'Sessional Test 1 (ST1)', type: 'Internal', questions: [{ q: 'Q1', coIds: ['CO1'], maxMarks: 20 }, { q: 'Q2', coIds: ['CO2'], maxMarks: 20 }] },
    { id: 'A2', courseId: 'C101', name: 'Assignments', type: 'Internal', questions: [{ q: 'Q1', coIds: ['CO3'], maxMarks: 10 }] },
    { id: 'A3', courseId: 'C101', name: 'External Examination (ETE)', type: 'External', questions: [{ q: 'Q1', coIds: ['CO1'], maxMarks: 25 }, { q: 'Q2', coIds: ['CO2'], maxMarks: 25 }, { q: 'Q3', coIds: ['CO3','CO1'], maxMarks: 25 }] },
    { id: 'A4', courseId: 'C102', name: 'Mid Term Exam', type: 'Internal', questions: [{ q: 'Q1', coIds: ['CO4'], maxMarks: 50 }] },
    { id: 'A5', courseId: 'C127', name: 'DSP Mid Term', type: 'Internal', questions: [{ q: 'Q1', coIds: ['CO9'], maxMarks: 25 }, { q: 'Q2', coIds: ['CO9','CO10'], maxMarks: 25 }] },
    { id: 'A6', courseId: 'C127', name: 'DSP Final Exam', type: 'External', questions: [{ q: 'Q1', coIds: ['CO9'], maxMarks: 50 }, { q: 'Q2', coIds: ['CO10'], maxMarks: 50 }] },
    { id: 'A7', courseId: 'C103', name: 'DLD Sessional 1', type: 'Internal', questions: [{ q: 'Q1', coIds: ['CO6'], maxMarks: 25 }, { q: 'Q2', coIds: ['CO7'], maxMarks: 25 }] }
  ],
  marks: [
    // C101 Marks
    { studentId: 'S001', assessmentId: 'A1', scores: [{ q: 'Q1', marks: 18 }, { q: 'Q2', marks: 15 }] },
    { studentId: 'S001', assessmentId: 'A2', scores: [{ q: 'Q1', marks: 8 }] },
    { studentId: 'S001', assessmentId: 'A3', scores: [{ q: 'Q1', marks: 20 }, { q: 'Q2', marks: 22 }, { q: 'Q3', marks: 19 }] },
    { studentId: 'S002', assessmentId: 'A1', scores: [{ q: 'Q1', marks: 12 }, { q: 'Q2', marks: 10 }] },
    { studentId: 'S002', assessmentId: 'A2', scores: [{ q: 'Q1', marks: 5 }] },
    { studentId: 'S002', assessmentId: 'A3', scores: [{ q: 'Q1', marks: 15 }, { q: 'Q2', marks: 18 }, { q: 'Q3', marks: 14 }] },
    
    // C102 Marks (Expanded)
    { studentId: 'S001', assessmentId: 'A4', scores: [{ q: 'Q1', marks: 48 }] },
    { studentId: 'S002', assessmentId: 'A4', scores: [{ q: 'Q1', marks: 35 }] },
    { studentId: 'S003', assessmentId: 'A4', scores: [{ q: 'Q1', marks: 45 }] },
    { studentId: 'S004', assessmentId: 'A4', scores: [{ q: 'Q1', marks: 30 }] },
    { studentId: 'S006', assessmentId: 'A4', scores: [{ q: 'Q1', marks: 41 }] },
    { studentId: 'S007', assessmentId: 'A4', scores: [{ q: 'Q1', marks: 28 }] },
    
    // C103 Marks (New)
    { studentId: 'S001', assessmentId: 'A7', scores: [{ q: 'Q1', marks: 22 }, { q: 'Q2', marks: 18 }] },
    { studentId: 'S002', assessmentId: 'A7', scores: [{ q: 'Q1', marks: 15 }, { q: 'Q2', marks: 20 }] },
    { studentId: 'S003', assessmentId: 'A7', scores: [{ q: 'Q1', marks: 24 }, { q: 'Q2', marks: 21 }] },
    { studentId: 'S004', assessmentId: 'A7', scores: [{ q: 'Q1', marks: 19 }] }, // Partially attempted
    { studentId: 'S006', assessmentId: 'A7', scores: [{ q: 'Q2', marks: 23 }] }, // Partially attempted
    
    // C127 Marks
    { studentId: 'S001', assessmentId: 'A5', scores: [{ q: 'Q1', marks: 22 }, { q: 'Q2', marks: 20 }] },
    { studentId: 'S001', assessmentId: 'A6', scores: [{ q: 'Q1', marks: 40 }, { q: 'Q2', marks: 38 }] },
    { studentId: 'S002', assessmentId: 'A5', scores: [{ q: 'Q1', marks: 15 }, { q: 'Q2', marks: 18 }] },
    { studentId: 'S002', assessmentId: 'A6', scores: [{ q: 'Q1', marks: 30 }, { q: 'Q2', marks: 35 }] },
  ],
};