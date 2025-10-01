import React, { createContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { User, Program, College, AppData } from '../types';

const API_URL = 'http://127.0.0.1:8000';

interface AppContextType {
  data: AppData | null;
  setData: React.Dispatch<React.SetStateAction<AppData | null>>;
  currentUser: User | null;
  selectedLoginCollege: College | null;
  selectedProgram: Program | null;
  selectedBatch: string | null;
  selectedCollegeId: string | null;
  setSelectedCollegeId: React.Dispatch<React.SetStateAction<string | null>>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setProgramAndBatch: (program: Program, batch: string) => void;
  goBackToProgramSelection: () => void;
  loading: boolean;
  error: string | null;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLoginCollege, setSelectedLoginCollege] = useState<College | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));

  // Fetch initial data from the backend
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setError(null);
        setLoading(true);
        const response = await fetch(`${API_URL}/api/all-data/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch data. Your session may have expired.');
        }
        const appData: AppData = await response.json();

        // Also fetch the current user
        const userResponse = await fetch(`${API_URL}/api/current-user/`, {
           headers: { 'Authorization': `Token ${token}` }
        });
         if (!userResponse.ok) throw new Error('Failed to fetch user details.');
        const userData: User = await userResponse.json();

        setData(appData);
        setCurrentUser(userData);

      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        setToken(null);
        setCurrentUser(null);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [token]);


  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/api-token-auth/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.non_field_errors?.[0] || 'Invalid credentials.');
        }

        const { token: apiToken } = await response.json();
        localStorage.setItem('authToken', apiToken);
        setToken(apiToken);
        return true;
    } catch (err: any) {
        setError(err.message);
        return false;
    } finally {
        setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    setSelectedProgram(null);
    setSelectedBatch(null);
    setSelectedCollegeId(null);
    setData(null); // Clear all data on logout
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
      loading,
      error,
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
      loading,
      error,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
