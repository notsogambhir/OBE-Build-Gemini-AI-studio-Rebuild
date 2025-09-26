// --- Enums and Basic Types ---
export type Role = 'Teacher' | 'Program Co-ordinator' | 'University' | 'Admin';
export type College = 'CUIET' | 'CCP' | 'CBS';
export type CourseStatus = 'Active' | 'Completed' | 'Future';

// --- Data Structures ---
export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  name: string;
}

export interface Program {
  id: string;
  name: string;
  collegeId: College;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  programId: string;
  target: number;
  internalWeightage: number;
  externalWeightage: number;
  attainmentLevels: {
    level3: number;
    level2: number;
    level1: number;
  };
  status: CourseStatus;
}

export interface Student {
  id: string;
  name: string;
}

export interface Enrollment {
  courseId: string;
  studentId: string;
}

export interface CourseOutcome {
  id: string;
  courseId: string;
  number: string;
  description: string;
}

export interface ProgramOutcome {
  id: string;
  number: string;
  description: string;
  programId: string;
}

export interface CoPoMapping {
  courseId: string;
  coId: string;
  poId: string;
  level: number;
}

export interface AssessmentQuestion {
  q: string;
  coIds: string[];
  maxMarks: number;
}

export interface Assessment {
  id: string;
  courseId: string;
  name: string;
  type: 'Internal' | 'External';
  questions: AssessmentQuestion[];
}

export interface MarkScore {
  q: string;
  marks: number;
}

export interface Mark {
  studentId: string;
  assessmentId: string;
  scores: MarkScore[];
}

// FIX: Added CoPoMap type for use in mapping matrix.
export interface CoPoMap {
  [coId: string]: {
    [poId: string]: number;
  };
}

// FIX: Added StudentMark type for use in assessment details.
export interface StudentMark {
  studentId: string;
  [key: string]: string | number | 'U';
}


export interface AppData {
  users: User[];
  colleges: { id: College; name: string }[];
  programs: Program[];
  courses: Course[];
  students: Student[];
  enrollments: Enrollment[];
  courseOutcomes: CourseOutcome[];
  programOutcomes: ProgramOutcome[];
  coPoMapping: CoPoMapping[];
  assessments: Assessment[];
  marks: Mark[];
}