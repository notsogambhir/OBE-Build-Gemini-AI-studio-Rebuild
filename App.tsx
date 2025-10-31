/**
 * @file App.tsx
 * @description
 * This is the main "brain" or "traffic controller" of the entire application.
 * It's the highest-level component that decides which page or layout to show the user.
 * 
 * It uses a tool called React Router (`HashRouter`) to act like a GPS for the app.
 * Based on the URL in the browser's address bar and whether the user is logged in,
 * it directs the user to the correct screen.
 * 
 * Main responsibilities:
 * 1.  Manages the primary routing logic (e.g., `/login`, `/dashboard`).
 * 2.  Acts as a gatekeeper: It shows the `LoginScreen` if the user is not logged in.
 * 3.  If the user is logged in, it passes control to the `ProtectedRoutes` component,
 *     which handles all the screens for authenticated users.
 */

import React from 'react';
// FIX: Changed react-router-dom import to namespace import to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from './hooks/useAppContext'; // Helper to get shared data like the current user.

// Importing all the different "pages" or "screens" of the application.
// Think of these as the different destinations our app's GPS can navigate to.
import LoginScreen from './pages/LoginScreen';
import ProgramSelectionScreen from './pages/ProgramSelectionScreen';
import MainLayout from './components/MainLayout'; // The main visual structure (Sidebar + Header).
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

/**
 * A special component that handles all the routing for a user who is already logged in.
 * It acts as a security guard and a smart navigator inside the main app.
 */
const ProtectedRoutes: React.FC = () => {
    // We ask our "magic backpack" (AppContext) for the current user and their selections.
    const { currentUser, selectedProgram, selectedBatch } = useAppContext();
    const location = ReactRouterDOM.useLocation(); // This tells us the user's current URL.

    // If for some reason there's no user, send them back to the login page immediately.
    if (!currentUser) {
        return <ReactRouterDOM.Navigate to="/login" state={{ from: location }} replace />;
    }

    // These users have dropdowns in their sidebar to choose programs, so they don't need the full-page selection screen.
    const rolesWithSidebarSelectors = ['Admin', 'University', 'Department'];
    // Check if the user needs to pick a program and batch to continue.
    const needsProgramSelection = !selectedProgram || !selectedBatch;

    // If a user (like a Teacher or PC) needs to select a program but hasn't yet,
    // we stop them and show them the ProgramSelectionScreen.
    if (needsProgramSelection && !rolesWithSidebarSelectors.includes(currentUser.role)) {
        return <ProgramSelectionScreen />;
    }
    
    // If the user is logged in and has made their selections (or doesn't need to),
    // we show them the main application layout with all the possible pages inside.
    return (
        // `MainLayout` provides the consistent Sidebar and Header for all pages.
        <MainLayout>
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
        </MainLayout>
    );
};


/**
 * The main App component. This is the root of our entire application's UI.
 */
const App: React.FC = () => {
  // Get the current user from our shared data "backpack".
  const { currentUser } = useAppContext();

  return (
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
  );
};

export default App;