import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import QuickAccessButtons from '../components/auth/QuickAccessButtons';
import { useAuth } from '../components/auth/AuthProvider';

const LoginPage = () => {
  const { login, quickLogin, loading } = useAuth();
  const [error, setError] = useState('');

  const handleLogin = async (credentials) => {
    try {
      setError('');
      await login(credentials);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuickLogin = (role) => {
    try {
      setError('');
      quickLogin(role);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">ERPindo</h1>
          <p className="text-muted-foreground">
            Sistem ERP Terintegrasi untuk Bisnis Indonesia
          </p>
        </div>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <LoginForm onLogin={handleLogin} loading={loading} />
        <QuickAccessButtons onQuickLogin={handleQuickLogin} />
      </div>
    </div>
  );
};

export default LoginPage;