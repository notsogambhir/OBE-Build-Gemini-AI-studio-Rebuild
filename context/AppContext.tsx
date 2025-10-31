import React, { createContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { User, Program, College, AppData } from '../types';

interface AppContextType {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  currentUser: User | null;
  selectedLoginCollege: College | null;
  selectedProgram: Program | null;
  selectedBatch: string | null;
  selectedCollegeId: string | null;
  setSelectedCollegeId: React.Dispatch<React.SetStateAction<string | null>>;
  login: (username: string, password: string, college: College) => boolean;
  logout: () => void;
  setProgramAndBatch: (program: Program, batch: string) => void;
  goBackToProgramSelection: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const LoadedAppProvider: React.FC<{ children: ReactNode, initialData: AppData }> = ({ children, initialData }) => {
  const [data, setData] = useState<AppData>(initialData);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLoginCollege, setSelectedLoginCollege] = useState<College | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
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
    setSelectedCollegeId(null);
  }, []);

  const setProgramAndBatch = useCallback((program: Program, batch: string) => {
    setSelectedProgram(program);
    setSelectedBatch(batch);
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


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialData, setInitialData] = useState<AppData | null>(null);

  useEffect(() => {
    fetch('./mockData.json')
      .then(res => res.json())
      .then(jsonData => {
        setInitialData(jsonData);
      })
      .catch(error => console.error("Failed to load mock data:", error));
  }, []);

  if (!initialData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
              <img src="https://d1hbpr09pwz0sk.cloudfront.net/logo_url/chitkara-university-4c35e411" alt="Logo" className="h-20 mx-auto mb-4 animate-pulse" />
              <p className="text-xl font-semibold text-gray-700">Loading Portal...</p>
          </div>
      </div>
    );
  }

  return <LoadedAppProvider initialData={initialData}>{children}</LoadedAppProvider>;
};