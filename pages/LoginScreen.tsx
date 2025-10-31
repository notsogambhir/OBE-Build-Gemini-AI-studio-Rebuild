/**
 * @file LoginScreen.tsx
 * @description
 * This file defines the `LoginScreen` component, which is the first page most users will see.
 *
 * Responsibilities:
 * 1.  Displays the university logo.
 * 2.  Shows a login form with fields for Username, Password, and College.
 * 3.  Handles user input and updates its internal memory (state).
 * 4.  When the user submits the form, it calls the `login` function from our "magic backpack"
 *     (AppContext) to check if the credentials are valid.
 * 5.  If login is successful, it navigates the user to the main part of the application.
 * 6.  If login fails, it displays an error message.
 * 7.  Includes a "developer shortcut" (double-clicking the logo) to quickly log in with a demo account.
 */

import React, { useState } from 'react';
// FIX: Changed react-router-dom import to namespace import to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext'; // Helper to get shared data.
import { College } from '../types'; // Imports the `College` type from our data dictionary.

// This is the main component function for the Login Screen.
const LoginScreen: React.FC = () => {
    // We ask our "magic backpack" (AppContext) for the tools we need.
    const { login, data, setProgramAndBatch } = useAppContext();
    
    // `useNavigate` gives us a function to tell the app to go to a different page.
    const navigate = ReactRouterDOM.useNavigate();

    // `useState` is a React Hook that gives a component its own memory.
    // Here, we create pieces of memory to store what the user types into the form fields.
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // We set the default college to the first one in our data list.
    const [college, setCollege] = useState<College>(data.colleges[0]?.id || 'CUIET');
    const [error, setError] = useState(''); // Memory for any error messages to display.

    // This function runs when the user clicks the "LOGIN" button.
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault(); // Prevents the browser from reloading the page, which is the default form behavior.
        setError(''); // Clear any previous error messages.
        
        // We call the `login` function from our magic backpack.
        if (login(username, password, college)) {
            // If `login` returns true (success), we navigate to the main application page.
            navigate('/');
        } else {
            // If `login` returns false (failure), we set an error message to show the user.
            setError('Invalid username or password.');
        }
    };

    // A secret shortcut for developers to log in quickly without typing.
    // It runs when the university logo is double-clicked.
    const handleDeveloperLoginShortcut = () => {
        const devUser = data.users.find(u => u.username === 'pc_ece');
        const devProgram = devUser ? data.programs.find(p => p.id === devUser.programId) : undefined;

        if (devUser && devProgram && devUser.password) {
            if (login(devUser.username, devUser.password, 'CUIET')) {
                // For this specific shortcut, we also pre-select a program and batch for the user.
                setProgramAndBatch(devProgram, '2025-2029');
                navigate('/'); // Navigate to the main app.
            }
        } else {
            console.error("Developer shortcut failed: Could not find user 'pc_ece' or their assigned program in mockData.");
        }
    };
    
    // Configuration for the quick login buttons.
    const quickLoginUsers = [
        { label: 'Teacher (ECE)', username: 'teacher_ece1', password: 'password', college: 'CUIET' as College, programUser: 'teacher_ece1' },
        { label: 'PC (ECE)', username: 'pc_ece', password: 'password', college: 'CUIET' as College, programUser: 'pc_ece' },
        { label: 'Department (CUIET)', username: 'dept_cuiet', password: 'password', college: 'CUIET' as College },
        { label: 'Admin', username: 'admin', password: 'password', college: 'CUIET' as College },
    ];

    // This function handles the logic for the quick login buttons.
    const handleQuickLogin = (userConfig: typeof quickLoginUsers[0]) => {
        setError(''); // Clear any previous errors.
        if (login(userConfig.username, userConfig.password, userConfig.college)) {
            // If the user role requires program selection, pre-select one for them.
            if (userConfig.programUser) {
                const user = data.users.find(u => u.username === userConfig.programUser);
                const program = user ? data.programs.find(p => p.id === user.programId) : undefined;
                if (user && program) {
                    // Find the latest batch for that program to make the demo relevant.
                    const latestBatch = data.batches
                        .filter(b => b.programId === program.id)
                        .sort((a,b) => b.name.localeCompare(a.name))[0];
                    if (latestBatch) {
                        setProgramAndBatch(program, latestBatch.name);
                    }
                }
            }
            navigate('/'); // Navigate to the main app.
        } else {
            setError(`Quick login for '${userConfig.label}' failed. Please check mockData.`);
        }
    };

    // The JSX below describes what the Login Screen looks like.
    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-100">
            <div className="w-full max-w-md p-8">
                {/* The university logo. Double-clicking it triggers the developer shortcut. */}
                <div className="flex justify-center mb-8" onDoubleClick={handleDeveloperLoginShortcut}>
                     <img src="https://d1hbpr09pwz0sk.cloudfront.net/logo_url/chitkara-university-4c35e411" alt="Logo" className="h-20" />
                </div>
                <div className="bg-white p-8 rounded-xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-center text-red-600 mb-6">LOG IN</h2>
                    {/* The `onSubmit` event on the form triggers our `handleLogin` function. */}
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="username" className="text-sm font-bold text-gray-600 tracking-wide">USERNAME</label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username} // The input's value is tied to our component's memory.
                                onChange={(e) => setUsername(e.target.value)} // When the user types, we update the memory.
                                className="w-full px-4 py-2 mt-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="password-input" className="text-sm font-bold text-gray-600 tracking-wide">PASSWORD</label>
                            <input
                                id="password-input"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="college" className="text-sm font-bold text-gray-600 tracking-wide">COLLEGE</label>
                            <select
                                id="college"
                                value={college}
                                onChange={(e) => setCollege(e.target.value as College)}
                                className="w-full px-4 py-2 mt-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                {/* We create an <option> for each college in our data. */}
                                {data.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        {/* If there's an error in our memory, we display it here. */}
                        {error && <p className="text-sm text-center text-red-600">{error}</p>}
                        
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center bg-red-600 text-gray-100 p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-red-700"
                            >
                                LOGIN
                            </button>
                        </div>
                    </form>

                     {/* Quick Login Buttons */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-center text-sm text-gray-500 mb-3">Or use a Quick Login:</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {quickLoginUsers.map(user => (
                                <button
                                    key={user.username}
                                    type="button"
                                    onClick={() => handleQuickLogin(user)}
                                    className="w-full px-2 py-2 text-xs font-bold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    aria-label={`Log in as ${user.label}`}
                                >
                                    {user.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* A helpful box showing demo login credentials. */}
                     <div className="p-4 mt-6 text-sm text-gray-600 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-center">Demo Logins (password: "password")</h4>
                      <ul className="mt-2 list-disc list-inside">
                        <li>Username: <strong>teacher_ece1</strong> (Teacher)</li>
                        <li>Username: <strong>pc_ece</strong> (PC)</li>
                        <li>Username: <strong>dept_cuiet</strong> (Dept, CUIET)</li>
                        <li>Username: <strong>dept_ccp</strong> (Dept, CCP)</li>
                        <li>Username: <strong>dept_cbs</strong> (Dept, CBS)</li>
                        <li>Username: <strong>university</strong></li>
                        <li>Username: <strong>admin</strong></li>
                      </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;