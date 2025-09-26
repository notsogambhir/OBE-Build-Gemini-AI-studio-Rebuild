import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './hooks/useAppContext';

import LoginScreen from './pages/LoginScreen';
import ProgramSelectionScreen from './pages/ProgramSelectionScreen';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import CoursesList from './pages/CoursesList';
import CourseDetail from './pages/CourseDetail';
import ProgramOutcomesList from './pages/ProgramOutcomesList';
import SettingsScreen from './pages/SettingsScreen';
import StudentCOAttainmentReport from './pages/StudentCOAttainmentReport';
import AttainmentReports from './pages/AttainmentReports';

const App: React.FC = () => {
  const { currentUser, selectedProgram, selectedBatch } = useAppContext();

  if (!currentUser) {
    return <LoginScreen />;
  }

  if (!selectedProgram || !selectedBatch) {
    return <ProgramSelectionScreen />;
  }

  return (
    <HashRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<CoursesList />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:courseId/report" element={<StudentCOAttainmentReport />} />
          <Route path="/program-outcomes" element={<ProgramOutcomesList />} />
          <Route path="/reports" element={<AttainmentReports />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MainLayout>
    </HashRouter>
  );
};

export default App;