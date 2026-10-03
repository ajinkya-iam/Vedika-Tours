import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { mockData } from '../../mock';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        if (data.session) {
          localStorage.setItem('vt_admin_authenticated', 'true');
          navigate('/admin');
          return;
        }
      } catch (err) {
        setErrorMessage(err.message || 'Login failed');
        setIsLoading(false);
        return;
      }
    }

    // Demo Mode fallback for initial setup/testing
    if (email === 'admin@vedikatours.com' && password === 'admin123') {
      localStorage.setItem('vt_admin_authenticated', 'true');
      navigate('/admin');
    } else {
      setErrorMessage('Invalid credentials. (For Demo test use: admin@vedikatours.com / admin123 or connect Supabase Auth)');
    }

    setIsLoading(false);
  };

  const handleDemoBypass = () => {
    localStorage.setItem('vt_admin_authenticated', 'true');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-orange-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Public Website</span>
        </Link>

        <img
          src={mockData.company.logo}
          alt="Vedika Tours"
          className="h-16 w-auto mx-auto mb-3"
        />
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Admin Portal Login
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Manage bookings, vehicles, rates & night charges
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 flex items-start space-x-2">
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vedikatours.com"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <div className="text-[11px] text-gray-400 mb-2">Development Demo Mode:</div>
            <button
              type="button"
              onClick={handleDemoBypass}
              className="w-full text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Instant One-Click Demo Access</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
