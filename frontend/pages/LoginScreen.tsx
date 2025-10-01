import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const LoginScreen: React.FC = () => {
  const { login, loading, error: contextError } = useAppContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      // The context will hold the error from the API, but we can set a generic one if needed
      setLocalError('Invalid username or password.');
    }
  }, [login, username, password, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100">
      <div className="w-full max-w-md p-8">
        <div className="flex justify-center mb-8">
          <img
            src="https://d1hbpr09pwz0sk.cloudfront.net/logo_url/chitkara-university-4c35e411"
            alt="Chitkara University Logo"
            className="h-20"
          />
        </div>
        <div className="bg-white p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-red-600 mb-6">
            LOG IN
          </h2>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="username"
                className="text-sm font-bold text-gray-600 tracking-wide"
              >
                USERNAME
              </label>
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
              <label
                htmlFor="password-input"
                className="text-sm font-bold text-gray-600 tracking-wide"
              >
                PASSWORD
              </label>
              <input
                id="password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {(localError || contextError) && (
              <p className="text-sm text-center text-red-600">
                {contextError || localError}
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center bg-red-600 text-gray-100 p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {loading ? 'LOGGING IN...' : 'LOGIN'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
