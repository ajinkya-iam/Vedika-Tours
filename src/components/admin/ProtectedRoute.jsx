import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      // 1. Check local demo authentication bypass
      const isDemoAuth = localStorage.getItem('vt_admin_authenticated') === 'true';
      if (isDemoAuth) {
        setIsAuthenticated(true);
        return;
      }

      // 2. Check Supabase session if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            localStorage.setItem('vt_admin_authenticated', 'true');
            setIsAuthenticated(true);
            return;
          }
        } catch (err) {
          console.warn('Auth check error:', err);
        }
      }

      setIsAuthenticated(false);
    }

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-gray-500">Checking admin authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
