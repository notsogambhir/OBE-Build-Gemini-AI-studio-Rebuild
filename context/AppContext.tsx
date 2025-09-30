import React, { createContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { User, Program, College, AppData } from '../types';
import { initialData } from '../mockData';

interface AppContextType {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  currentUser: User | null;
  selectedLoginCollege: College | null;
  selectedProgram: Program | null;
  selectedBatch: string | null;
  // FIX: Add selectedCollegeId to context to be globally accessible for high-level users (Admin/University).
  selectedCollegeId: string | null;
  setSelectedCollegeId: React.Dispatch<React.SetStateAction<string | null>>;
  login: (username: string, password: string, college: College) => boolean;
  logout: () => void;
  setProgramAndBatch: (program: Program, batch: string) => void;
  goBackToProgramSelection: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(initialData);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLoginCollege, setSelectedLoginCollege] = useState<College | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  // FIX: Add state for selectedCollegeId to make it available throughout the app.
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

  const login = useCallback((username: string, password: string, college: College) => {
    const user = data.users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );
    if (user) {
      setCurrentUser(user);
      setSelectedLoginCollege(college);
      // Reset program selection on new login for non-high-level users
      if (user.role !== 'Admin' && user.role !== 'University' && user.role !== 'Department') {
        setSelectedProgram(null);
        setSelectedBatch(null);
      }
      return true;
    }
    return false;
  }, [data.users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setSelectedLoginCollege(null);
    setSelectedProgram(null);
    setSelectedBatch(null);
    // FIX: Clear selectedCollegeId on logout.
    setSelectedCollegeId(null);
  }, []);

  const setProgramAndBatch = useCallback((program: Program, batch: string) => {
    setSelectedProgram(program);
    setSelectedBatch(batch);
    // FIX: Keep selectedCollegeId in sync when a program is selected.
    setSelectedCollegeId(program.collegeId);
  }, []);

  const goBackToProgramSelection = useCallback(() => {
    setSelectedProgram(null);
    setSelectedBatch(null);
  }, []);

  const value = useMemo(
    () => ({
      data,
      setData,
      currentUser,
      login,
      logout,
      selectedLoginCollege,
      selectedProgram,
      selectedBatch,
      setProgramAndBatch,
      goBackToProgramSelection,
      // FIX: Expose selectedCollegeId and its setter through the context.
      selectedCollegeId,
      setSelectedCollegeId,
    }),
    [
      data,
      currentUser,
      login,
      logout,
      selectedLoginCollege,
      selectedProgram,
      selectedBatch,
      setProgramAndBatch,
      goBackToProgramSelection,
      selectedCollegeId,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
