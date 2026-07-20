import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, TrendingUp, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { authStart, authSuccess, authFailure } from '../store/slices/authSlice.js';
import api from '../services/api.js';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Watch password field to validate confirmPassword matches
  const password = watch('password');

  // If already authenticated, redirect to dashboard
  if (isAuthenticated && !loading) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    setApiError(null);
    dispatch(authStart());
    try {
      const response = await api.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      // Save token to localStorage
      localStorage.setItem('accessToken', response.data.accessToken);

      // Dispatch success to Redux store
      dispatch(authSuccess(response.data.user));

      // Navigate to dashboard
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Username or email may already be in use.';
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
          <h2 className="text-2xl font-extrabold text-white tracking-tight">CREATE AN ACCOUNT</h2>
          <p className="text-dark-text-muted text-sm mt-1">Start trading virtual stocks risk-free</p>
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/90 uppercase tracking-wider">Username</label>
            <input
              type="text"
              placeholder="Pick a unique username"
              className={`w-full px-4 py-2 rounded-lg bg-dark-bg border text-sm text-white placeholder:text-dark-text-muted outline-none transition-all duration-200 focus:border-bull-green/50 focus:ring-1 focus:ring-bull-green/20 ${
                errors.username ? 'border-bear-red/60' : 'border-dark-border'
              }`}
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' },
                maxLength: { value: 30, message: 'Username cannot exceed 30 characters' },
                pattern: {
                  value: /^[a-zA-Z0-9_-]+$/,
                  message: 'Username can only contain alphanumeric characters, underscores, and hyphens',
                },
              })}
            />
            {errors.username && (
              <span className="text-xs text-bear-red font-medium block pl-1">
                {errors.username.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/90 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              className={`w-full px-4 py-2 rounded-lg bg-dark-bg border text-sm text-white placeholder:text-dark-text-muted outline-none transition-all duration-200 focus:border-bull-green/50 focus:ring-1 focus:ring-bull-green/20 ${
                errors.email ? 'border-bear-red/60' : 'border-dark-border'
              }`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <span className="text-xs text-bear-red font-medium block pl-1">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/90 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                className={`w-full pl-4 pr-10 py-2 rounded-lg bg-dark-bg border text-sm text-white placeholder:text-dark-text-muted outline-none transition-all duration-200 focus:border-bull-green/50 focus:ring-1 focus:ring-bull-green/20 ${
                  errors.password ? 'border-bear-red/60' : 'border-dark-border'
                }`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
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

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/90 uppercase tracking-wider">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              className={`w-full px-4 py-2 rounded-lg bg-dark-bg border text-sm text-white placeholder:text-dark-text-muted outline-none transition-all duration-200 focus:border-bull-green/50 focus:ring-1 focus:ring-bull-green/20 ${
                errors.confirmPassword ? 'border-bear-red/60' : 'border-dark-border'
              }`}
              {...register('confirmPassword', {
                required: 'Confirm password is required',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <span className="text-xs text-bear-red font-medium block pl-1">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bull-green hover:bg-bull-green/90 disabled:bg-bull-green/60 text-dark-bg font-bold py-3 mt-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-bull-green/10"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-dark-text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-bull-green hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
