import { AppData } from './types';

export const initialData: AppData = {
  users: [
    // Admins
    { id: 'U_ADMIN', username: 'admin', password: 'password', role: 'Admin', name: 'Admin User' },
    { id: 'U_UNIV', username: 'university', password: 'password', role: 'University', name: 'Dean Adams' },
    
    // --- CUIET Staff ---
    // PC for BE ME (P1)
    { id: 'PC_ME', username: 'pc_me', password: 'password', role: 'Program Co-ordinator', name: 'Mr. Mehra', programId: 'P1' },
    // Teachers under Mr. Mehra
    { id: 'T_ME_1', username: 'teacher_me1', password: 'password', role: 'Teacher', name: 'Prof. Anjali', programCoordinatorId: 'PC_ME', status: 'Active' },
    { id: 'T_ME_2', username: 'teacher_me2', password: 'password', role: 'Teacher', name: 'Dr. Singh', programCoordinatorId: 'PC_ME', status: 'Active' },
    { id: 'T_ME_3', username: 'teacher_me3', password: 'password', role: 'Teacher', name: 'Ms. Gupta', programCoordinatorId: 'PC_ME', status: 'Active' },

    // PC for BE ECE (P2)
    { id: 'PC_ECE', username: 'pc_ece', password: 'password', role: 'Program Co-ordinator', name: 'Ms. Jones', programId: 'P2' },
    // Teachers under Ms. Jones
    { id: 'T_ECE_1', username: 'teacher_ece1', password: 'password', role: 'Teacher', name: 'Dr. Smith', programCoordinatorId: 'PC_ECE', status: 'Active' },
    { id: 'T_ECE_2', username: 'teacher_ece2', password: 'password', role: 'Teacher', name: 'Prof. Davis', programCoordinatorId: 'PC_ECE', status: 'Active' },
    { id: 'T_ECE_3', username: 'teacher_ece3', password: 'password', role: 'Teacher', name: 'Mr. Wilson', programCoordinatorId: 'PC_ECE', status: 'Active' },

    // --- CCP Staff ---
    // PC for B. Pharma (P3)
    { id: 'PC_BPHARMA', username: 'pc_bpharma', password: 'password', role: 'Program Co-ordinator', name: 'Dr. Patel', programId: 'P3' },
    // Teachers under Dr. Patel
    { id: 'T_BPHARMA_1', username: 'teacher_bpharma1', password: 'password', role: 'Teacher', name: 'Ms. Chen', programCoordinatorId: 'PC_BPHARMA', status: 'Active' },
    { id: 'T_BPHARMA_2', username: 'teacher_bpharma2', password: 'password', role: 'Teacher', name: 'Dr. Reddy', programCoordinatorId: 'PC_BPHARMA', status: 'Active' },
    { id: 'T_BPHARMA_3', username: 'teacher_bpharma3', password: 'password', role: 'Teacher', name: 'Prof. Iyer', programCoordinatorId: 'PC_BPHARMA', status: 'Active' },
    
    // PC for M. Pharma (P4)
    { id: 'PC_MPHARMA', username: 'pc_mpharma', password: 'password', role: 'Program Co-ordinator', name: 'Dr. Verma', programId: 'P4' },
    // Teachers under Dr. Verma
    { id: 'T_MPHARMA_1', username: 'teacher_mpharma1', password: 'password', role: 'Teacher', name: 'Mr. Ali', programCoordinatorId: 'PC_MPHARMA', status: 'Active' },
    { id: 'T_MPHARMA_2', username: 'teacher_mpharma2', password: 'password', role: 'Teacher', name: 'Mrs. Khan', programCoordinatorId: 'PC_MPHARMA', status: 'Active' },
    { id: 'T_MPHARMA_3', username: 'teacher_mpharma3', password: 'password', role: 'Teacher', name: 'Dr. Bose', programCoordinatorId: 'PC_MPHARMA', status: 'Active' },

    // --- CBS Staff ---
    // PC for BBA (P5)
    { id: 'PC_BBA', username: 'pc_bba', password: 'password', role: 'Program Co-ordinator', name: 'Mr. Carter', programId: 'P5' },
    // Teachers under Mr. Carter
    { id: 'T_BBA_1', username: 'teacher_bba1', password: 'password', role: 'Teacher', name: 'Mrs. Lee', programCoordinatorId: 'PC_BBA', status: 'Active' },
    { id: 'T_BBA_2', username: 'teacher_bba2', password: 'password', role: 'Teacher', name: 'Mr. Scott', programCoordinatorId: 'PC_BBA', status: 'Active' },
    { id: 'T_BBA_3', username: 'teacher_bba3', password: 'password', role: 'Teacher', name: 'Ms. Adams', programCoordinatorId: 'PC_BBA', status: 'Active' },
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
    // BE ECE Program (P2) - Teachers: T_ECE_1 (Smith), T_ECE_2 (Davis), T_ECE_3 (Wilson)
    { id: 'C101', name: 'Introduction to Programming', code: 'CS101', programId: 'P2', status: 'Completed', teacherId: 'T_ECE_1', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C102', name: 'Database Management Systems', code: 'CS203', programId: 'P2', status: 'Active', teacherId: 'T_ECE_1', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C103', name: 'Network Theory', code: 'EC201', programId: 'P2', status: 'Completed', teacherId: 'T_ECE_2', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C201', name: 'Digital Logic Design', code: 'EC202', programId: 'P2', status: 'Active', teacherId: 'T_ECE_2', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C202', name: 'Signals and Systems', code: 'EC204', programId: 'P2', status: 'Active', teacherId: 'T_ECE_2', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C301', name: 'Microprocessors', code: 'EC301', programId: 'P2', status: 'Active', teacherId: 'T_ECE_3', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C302', name: 'Communication Systems', code: 'EC305', programId: 'P2', status: 'Active', teacherId: 'T_ECE_3', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C401', name: 'VLSI Design', code: 'EC401', programId: 'P2', status: 'Future', teacherId: null, target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C402', name: 'Embedded Systems', code: 'EC405', programId: 'P2', status: 'Future', teacherId: null, target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    
    // BE ME Program (P1)
    { id: 'C_ME_1', name: 'Engineering Mechanics', code: 'ME101', programId: 'P1', status: 'Active', teacherId: 'T_ME_1', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
    { id: 'C_ME_2', name: 'Thermodynamics', code: 'ME201', programId: 'P1', status: 'Active', teacherId: 'T_ME_2', target: 50, internalWeightage: 25, externalWeightage: 75, attainmentLevels: { level3: 80, level2: 70, level1: 50 } },
  ],
  students: Array.from({ length: 65 }, (_, i) => ({
    id: `251097${(i + 1).toString().padStart(3, '0')}`,
    name: `Student ECE ${(i + 1)}`,
    programId: 'P2',
    status: 'Active' as const
  })),
  enrollments: [
    // Enroll all 65 students in the 5 active ECE courses
    ...Array.from({ length: 65 }, (_, i) => `251097${(i + 1).toString().padStart(3, '0')}`).flatMap(studentId => 
      ['C102', 'C201', 'C202', 'C301', 'C302'].map(courseId => ({ studentId, courseId }))
    )
  ],
  courseOutcomes: [
    // COs for C102 (DBMS)
    { id: 'CO_C102_1', courseId: 'C102', number: 'CO1', description: 'Understand database concepts and structures.' },
    { id: 'CO_C102_2', courseId: 'C102', number: 'CO2', description: 'Design and implement a relational database.' },
    { id: 'CO_C102_3', courseId: 'C102', number: 'CO3', description: 'Formulate queries using SQL.' },
    // COs for C201 (Digital Logic)
    { id: 'CO_C201_1', courseId: 'C201', number: 'CO1', description: 'Understand number systems and logic gates.' },
    { id: 'CO_C201_2', courseId: 'C201', number: 'CO2', description: 'Design combinational and sequential logic circuits.' },
  ],
  programOutcomes: [
    // POs for BE ECE (P2)
    { id: 'PO_P2_1', programId: 'P2', number: 'PO1', description: 'Engineering knowledge' },
    { id: 'PO_P2_2', programId: 'P2', number: 'PO2', description: 'Problem analysis' },
    { id: 'PO_P2_3', programId: 'P2', number: 'PO3', description: 'Design/development of solutions' },
    { id: 'PO_P2_4', programId: 'P2', number: 'PO4', description: 'Conduct investigations of complex problems' },
  ],
  coPoMapping: [
    // Mapping for C102 (DBMS)
    { courseId: 'C102', coId: 'CO_C102_1', poId: 'PO_P2_1', level: 3 },
    { courseId: 'C102', coId: 'CO_C102_2', poId: 'PO_P2_2', level: 2 },
    { courseId: 'C102', coId: 'CO_C102_3', poId: 'PO_P2_3', level: 3 },
    // Mapping for C201 (Digital Logic)
    { courseId: 'C201', coId: 'CO_C201_1', poId: 'PO_P2_1', level: 3 },
    { courseId: 'C201', coId: 'CO_C201_2', poId: 'PO_P2_3', level: 3 },
  ],
  assessments: [
    // Assessments for C102 (DBMS)
    { id: 'A_C102_1', courseId: 'C102', name: 'Sessional Test 1', type: 'Internal', questions: [
      { q: 'Q1', coIds: ['CO_C102_1'], maxMarks: 10 }, { q: 'Q2', coIds: ['CO_C102_2'], maxMarks: 15 },
    ]},
    { id: 'A_C102_2', courseId: 'C102', name: 'Final Exam', type: 'External', questions: [
      { q: 'Q1', coIds: ['CO_C102_1', 'CO_C102_2'], maxMarks: 20 }, { q: 'Q2', coIds: ['CO_C102_3'], maxMarks: 25 },
    ]},
     // Assessments for C201 (Digital Logic)
    { id: 'A_C201_1', courseId: 'C201', name: 'Sessional Test 1', type: 'Internal', questions: [
      { q: 'Q1', coIds: ['CO_C201_1'], maxMarks: 10 }, { q: 'Q2', coIds: ['CO_C201_2'], maxMarks: 10 },
    ]},
  ],
  marks: [
    // Marks for C102 - Sessional Test 1 (A_C102_1)
    ...Array.from({ length: 65 }, (_, i) => {
      const studentId = `251097${(i + 1).toString().padStart(3, '0')}`;
      const scores = [
        { q: 'Q1', marks: Math.floor(Math.random() * 8) + 3 }, // Score 3-10
        { q: 'Q2', marks: Math.floor(Math.random() * 10) + 5 } // Score 5-14
      ];
      // Make ~20% of students miss Q2
      if (i % 5 === 0) {
        scores.pop();
      }
      return { studentId, assessmentId: 'A_C102_1', scores };
    }),
     // Marks for C201 - Sessional Test 1 (A_C201_1)
    ...Array.from({ length: 65 }, (_, i) => {
      const studentId = `251097${(i + 1).toString().padStart(3, '0')}`;
      const scores = [
        { q: 'Q1', marks: Math.floor(Math.random() * 9) + 2 }, // Score 2-10
        { q: 'Q2', marks: Math.floor(Math.random() * 9) + 2 } // Score 2-10
      ];
       // Make ~10% of students miss Q1
      if (i % 10 === 0) {
        scores.shift();
      }
      return { studentId, assessmentId: 'A_C201_1', scores };
    })
  ],
};
