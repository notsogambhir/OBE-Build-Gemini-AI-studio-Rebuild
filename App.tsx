import React from 'react';
<<<<<<< HEAD
// FIX: Changed react-router-dom import to namespace import to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from './hooks/useAppContext'; // Helper to get shared data like the current user.
=======
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from './hooks/useAppContext';
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)

import LoginScreen from './pages/LoginScreen';
import ProgramSelectionScreen from './pages/ProgramSelectionScreen';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import CoursesList from './pages/CoursesList';
import CourseDetail from './pages/CourseDetail';
import ProgramOutcomesList from './pages/ProgramOutcomesList';
import StudentCOAttainmentReport from './pages/StudentCOAttainmentReport';
import AttainmentReports from './pages/AttainmentReports';
import StudentsList from './pages/StudentsList';
import TeacherManagement from './pages/TeacherManagement';
import TeacherDetails from './pages/TeacherDetails';
import DepartmentStudentManagement from './pages/DepartmentStudentManagement';
import DepartmentFacultyManagement from './pages/DepartmentFacultyManagement';
import AdminPanel from './pages/AdminPanel';

const ProtectedRoutes: React.FC = () => {
    const { currentUser, selectedProgram, selectedBatch } = useAppContext();
<<<<<<< HEAD
    const location = ReactRouterDOM.useLocation(); // This tells us the user's current URL.
=======
    const location = useLocation();
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)

    if (!currentUser) {
        return <ReactRouterDOM.Navigate to="/login" state={{ from: location }} replace />;
    }

    // Department user workflow
    if (currentUser.role === 'Department') {
        return (
            <MainLayout>
                <Routes>
                    <Route path="/department/students" element={<DepartmentStudentManagement />} />
                    <Route path="/department/faculty" element={<DepartmentFacultyManagement />} />
                    <Route path="*" element={<Navigate to="/department/students" replace />} />
                </Routes>
            </MainLayout>
        );
    }

    // Admin user workflow
    if (currentUser.role === 'Admin') {
        return (
             <MainLayout>
                <Routes>
                    {/* Admin-specific routes */}
                    <Route path="/admin/academic-structure" element={<AdminPanel view="Academic Structure" />} />
                    <Route path="/admin/user-management" element={<AdminPanel view="User Management" />} />
                    <Route path="/admin/system-settings" element={<AdminPanel view="System Settings" />} />

                    {/* Standard routes also accessible by Admin */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/courses" element={<CoursesList />} />
                    <Route path="/courses/:courseId" element={<CourseDetail />} />
                    <Route path="/courses/:courseId/report" element={<StudentCOAttainmentReport />} />
                    <Route path="/program-outcomes" element={<ProgramOutcomesList />} />
                    <Route path="/students" element={<StudentsList />} />
                    <Route path="/reports" element={<AttainmentReports />} />
                    
                    {/* Default admin route */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </MainLayout>
        );
    }
    
    // Program selection gate for other roles
    const needsProgramSelection = !selectedProgram || !selectedBatch;
    if (needsProgramSelection && currentUser.role !== 'University') {
        return <ProgramSelectionScreen />;
    }
    
    // Default workflow for authenticated users with a selected program
    return (
        <MainLayout>
<<<<<<< HEAD
            {/* The `Routes` component looks at the URL and decides which page `element` to show. */}
            <ReactRouterDOM.Routes>
                {/* Admin-specific pages */}
                <ReactRouterDOM.Route path="/admin/academic-structure" element={<AdminPanel view="Academic Structure" />} />
                <ReactRouterDOM.Route path="/admin/user-management" element={<AdminPanel view="User Management" />} />
                <ReactRouterDOM.Route path="/admin/system-settings" element={<AdminPanel view="System Settings" />} />
                
                {/* Department-specific pages */}
                <ReactRouterDOM.Route path="/department/students" element={<DepartmentStudentManagement />} />
                <ReactRouterDOM.Route path="/department/faculty" element={<DepartmentFacultyManagement />} />

                {/* Standard pages accessible by multiple roles (Teacher, PC, Admin, Department, etc.) */}
                <ReactRouterDOM.Route path="/dashboard" element={<Dashboard />} />
                <ReactRouterDOM.Route path="/courses" element={<CoursesList />} />
                {/* The ":courseId" part is a placeholder for the actual ID of a course. */}
                <ReactRouterDOM.Route path="/courses/:courseId" element={<CourseDetail />} />
                <ReactRouterDOM.Route path="/courses/:courseId/report" element={<StudentCOAttainmentReport />} />
                <ReactRouterDOM.Route path="/program-outcomes" element={<ProgramOutcomesList />} />
                <ReactRouterDOM.Route path="/students" element={<StudentsList />} />
                <ReactRouterDOM.Route path="/teachers" element={<TeacherManagement />} />
                <ReactRouterDOM.Route path="/teachers/:teacherId" element={<TeacherDetails />} />
                <ReactRouterDOM.Route path="/reports" element={<AttainmentReports />} />
                <ReactRouterDOM.Route path="/program-selection" element={<ProgramSelectionScreen />} />
                
                {/* This is the default "catch-all" route. If the URL doesn't match anything above,
                    it will redirect the user to a default page based on their role. */}
                <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to={
                    // A Department user's default page is different from others.
                    currentUser.role === 'Department' ? "/department/faculty" : "/dashboard"
                } replace />} />
            </ReactRouterDOM.Routes>
=======
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/courses" element={<CoursesList />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/courses/:courseId/report" element={<StudentCOAttainmentReport />} />
                <Route path="/program-outcomes" element={<ProgramOutcomesList />} />
                <Route path="/students" element={<StudentsList />} />
                <Route path="/teachers" element={<TeacherManagement />} />
                <Route path="/teachers/:teacherId" element={<TeacherDetails />} />
                <Route path="/reports" element={<AttainmentReports />} />
                <Route path="/program-selection" element={<ProgramSelectionScreen />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)
        </MainLayout>
    );
};


const App: React.FC = () => {
  const { currentUser } = useAppContext();

  return (
<<<<<<< HEAD
    // `HashRouter` is the component that enables all the routing functionality (the app's GPS).
    <ReactRouterDOM.HashRouter>
        {/* `Routes` decides which of the top-level routes to render. */}
        <ReactRouterDOM.Routes>
            {/* If the URL is `/login`, show the LoginScreen. */}
            <ReactRouterDOM.Route path="/login" element={<LoginScreen />} />
            {/* For any other URL (`/*`), check if a user is logged in.
                If yes, render the `ProtectedRoutes` component which contains the main app.
                If no, redirect them back to the `/login` page. */}
            <ReactRouterDOM.Route path="/*" element={currentUser ? <ProtectedRoutes /> : <ReactRouterDOM.Navigate to="/login" />} />
        </ReactRouterDOM.Routes>
    </ReactRouterDOM.HashRouter>
=======
    <HashRouter>
        <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/*" element={currentUser ? <ProtectedRoutes /> : <Navigate to="/login" />} />
        </Routes>
    </HashRouter>
>>>>>>> parent of ca350be (feat: Initialize app entry points and types)
  );
};

export default App;