import React, { createContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { User, Program, College, AppData } from '../types';
import { initialData } from '../data/mockData';

interface AppContextType {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  currentUser: User | null;
  selectedLoginCollege: College | null;
  selectedProgram: Program | null;
  selectedBatch: string | null;
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

  const login = useCallback((username: string, password: string, college: College) => {
    const user = data.users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );
    if (user) {
      setCurrentUser(user);
      setSelectedLoginCollege(college);
      return true;
    }
    return false;
  }, [data.users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setSelectedLoginCollege(null);
    setSelectedProgram(null);
    setSelectedBatch(null);
  }, []);

  const setProgramAndBatch = useCallback((program: Program, batch: string) => {
    setSelectedProgram(program);
    setSelectedBatch(batch);
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
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
