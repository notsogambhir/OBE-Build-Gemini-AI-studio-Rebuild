import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { College } from '../types';

const LoginScreen: React.FC = () => {
    const { login, data } = useAppContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [college, setCollege] = useState<College>(data.colleges[0]?.id || 'CUIET');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!login(username, password, college)) {
            setError('Invalid username or password.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8">
                <div className="flex justify-center mb-8">
                     <img src="https://www.chitkara.edu.in/wp-content/uploads/2022/11/chitkara-university-logo.png" alt="Chitkara University Logo" className="h-20" />
                </div>
                <div className="bg-white p-8 rounded-xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-center text-red-600 mb-6">LOG IN</h2>
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="username" className="text-sm font-bold text-gray-600 tracking-wide">USERNAME</label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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
                                {data.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

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
                     <div className="p-4 mt-6 text-sm text-gray-600 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-center">Demo Logins (password: "password")</h4>
                      <ul className="mt-2 list-disc list-inside">
                        <li>Username: <strong>teacher</strong></li>
                        <li>Username: <strong>manager</strong></li>
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
