import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, TrendingUp, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { authStart, authSuccess, authFailure } from '../store/slices/authSlice.js';
import api from '../services/api.js';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated && !loading) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    setApiError(null);
    dispatch(authStart());
    try {
      const response = await api.post('/auth/login', {
        emailOrUsername: data.emailOrUsername,
        password: data.password,
      });

      // Save token to localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      
      // Dispatch success to Redux store
      dispatch(authSuccess(response.data.user));
      
      // Navigate to dashboard
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setApiError(errorMsg);
      dispatch(authFailure(errorMsg));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-bg px-4 py-12 relative overflow-hidden select-none">
      {/* Decorative background blur objects */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-bull-green/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bear-red/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10 glow-bull"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-bull-green/10 flex items-center justify-center mb-3">
            <TrendingUp className="h-7 w-7 text-bull-green" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">SB STOCKS</h2>
          <p className="text-dark-text-muted text-sm mt-1">Sign in to your paper trading account</p>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 p-3 rounded-lg bg-bear-red/10 border border-bear-red/20 text-bear-red text-sm"
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{apiError}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email / Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/90 uppercase tracking-wider">Email or Username</label>
            <input
              type="text"
              placeholder="Enter your email or username"
              className={`w-full px-4 py-2.5 rounded-lg bg-dark-bg border text-sm text-white placeholder:text-dark-text-muted outline-none transition-all duration-200 focus:border-bull-green/50 focus:ring-1 focus:ring-bull-green/20 ${
                errors.emailOrUsername ? 'border-bear-red/60' : 'border-dark-border'
              }`}
              {...register('emailOrUsername', { required: 'Email or Username is required' })}
            />
            {errors.emailOrUsername && (
              <span className="text-xs text-bear-red font-medium block pl-1">
                {errors.emailOrUsername.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-white/90 uppercase tracking-wider">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-bull-green hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`w-full pl-4 pr-10 py-2.5 rounded-lg bg-dark-bg border text-sm text-white placeholder:text-dark-text-muted outline-none transition-all duration-200 focus:border-bull-green/50 focus:ring-1 focus:ring-bull-green/20 ${
                  errors.password ? 'border-bear-red/60' : 'border-dark-border'
                }`}
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-text-muted hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-bear-red font-medium block pl-1">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bull-green hover:bg-bull-green/90 disabled:bg-bull-green/60 text-dark-bg font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-bull-green/10"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-dark-text-muted mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-bull-green hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
