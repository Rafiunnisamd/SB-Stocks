import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Lock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { updateUserProfile } from '../store/slices/authSlice.js';
import api from '../services/api.js';

// Pre-defined Dicebear SVGs for user avatars
const AVATAR_OPTIONS = [
  { key: 'bull', label: 'Bullish Trader', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bull' },
  { key: 'bear', label: 'Bearish Short', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bear' },
  { key: 'whale', label: 'Whale Investor', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=whale' },
  { key: 'shark', label: 'Day Shark', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=shark' },
  { key: 'rocket', label: 'Moon Rider', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=rocket' },
];

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Profile forms states
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0].url);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password change form states
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      username: user?.username || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm();

  const newPassword = watch('newPassword');

  const onUpdateProfile = async (data) => {
    setProfileSuccess(null);
    setProfileError(null);
    setUpdatingProfile(true);

    try {
      const response = await api.put('/auth/profile', {
        username: data.username,
        avatar: selectedAvatar,
      });
      dispatch(updateUserProfile(response.data.user));
      setProfileSuccess('Profile metadata updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setPasswordSuccess(null);
    setPasswordError(null);
    setUpdatingPassword(true);

    try {
      await api.put('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccess('Password changed successfully.');
      resetPasswordForm();
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Double check your current password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Profile Settings</h1>
        <p className="text-xs text-dark-text-muted mt-1">Manage your virtual trading profile credentials and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: General Profile Setup & Avatar choice */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Profile Info Form */}
          <div className="rounded-xl bg-dark-card border border-dark-border p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-bull-green" />
              <span>General Information</span>
            </h3>

            {profileSuccess && (
              <div className="flex gap-2 p-3 rounded-lg bg-bull-green/10 border border-bull-green/20 text-xs text-bull-green">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="flex gap-2 p-3 rounded-lg bg-bear-red/10 border border-bear-red/20 text-xs text-bear-red">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-5">
              {/* Read only email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-dark-text-muted uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark-bg/60 border border-dark-border/40 text-sm text-dark-text-muted cursor-not-allowed outline-none"
                />
              </div>

              {/* Editable Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-dark-text-muted uppercase tracking-wider">Trading Alias (Username)</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className={`w-full px-3 py-2.5 rounded-lg bg-dark-bg border text-sm text-white outline-none focus:border-bull-green/45 focus:ring-1 focus:ring-bull-green/10 ${
                    profileErrors.username ? 'border-bear-red/60' : 'border-dark-border'
                  }`}
                  {...registerProfile('username', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Username must be at least 3 characters' },
                  })}
                />
                {profileErrors.username && (
                  <span className="text-xs text-bear-red pl-1">{profileErrors.username.message}</span>
                )}
              </div>

              {/* Avatar Selector Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-dark-text-muted uppercase tracking-wider block">Choose Avatar</label>
                <div className="flex flex-wrap gap-4 pt-1">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedAvatar(opt.url)}
                      className={`h-14 w-14 rounded-xl flex items-center justify-center p-1.5 border transition-all ${
                        selectedAvatar === opt.url
                          ? 'border-bull-green bg-bull-green/10 shadow-lg shadow-bull-green/5 scale-105'
                          : 'border-dark-border bg-dark-bg hover:border-dark-text-muted'
                      }`}
                      title={opt.label}
                    >
                      <img src={opt.url} alt={opt.label} className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="bg-bull-green hover:bg-bull-green/90 disabled:bg-bull-green/50 text-dark-bg font-bold text-xs px-5 py-2.5 rounded-lg transition-all"
              >
                {updatingProfile ? 'Saving...' : 'Update Settings'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Change Password Form */}
        <div className="space-y-6">
          <div className="rounded-xl bg-dark-card border border-dark-border p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-dark-border/40 pb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-bull-green" />
              <span>Change Password</span>
            </h3>

            {passwordSuccess && (
              <div className="flex gap-2 p-3 rounded-lg bg-bull-green/10 border border-bull-green/20 text-xs text-bull-green">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="flex gap-2 p-3 rounded-lg bg-bear-red/10 border border-bear-red/20 text-xs text-bear-red">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-dark-text-muted uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 rounded-lg bg-dark-bg border text-xs text-white outline-none focus:border-bull-green/45 focus:ring-1 focus:ring-bull-green/10 ${
                    passwordErrors.currentPassword ? 'border-bear-red/60' : 'border-dark-border'
                  }`}
                  {...registerPassword('currentPassword', { required: 'Current password is required' })}
                />
                {passwordErrors.currentPassword && (
                  <span className="text-[10px] text-bear-red pl-1">{passwordErrors.currentPassword.message}</span>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-dark-text-muted uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  className={`w-full px-3 py-2 rounded-lg bg-dark-bg border text-xs text-white outline-none focus:border-bull-green/45 focus:ring-1 focus:ring-bull-green/10 ${
                    passwordErrors.newPassword ? 'border-bear-red/60' : 'border-dark-border'
                  }`}
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />
                {passwordErrors.newPassword && (
                  <span className="text-[10px] text-bear-red pl-1">{passwordErrors.newPassword.message}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-dark-text-muted uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  className={`w-full px-3 py-2 rounded-lg bg-dark-bg border text-xs text-white outline-none focus:border-bull-green/45 focus:ring-1 focus:ring-bull-green/10 ${
                    passwordErrors.confirmPassword ? 'border-bear-red/60' : 'border-dark-border'
                  }`}
                  {...registerPassword('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (value) => value === newPassword || 'Passwords do not match',
                  })}
                />
                {passwordErrors.confirmPassword && (
                  <span className="text-[10px] text-bear-red pl-1">{passwordErrors.confirmPassword.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full bg-bull-green hover:bg-bull-green/90 disabled:bg-bull-green/50 text-dark-bg font-bold text-xs py-2.5 mt-2 rounded-lg transition-all"
              >
                {updatingPassword ? 'Saving...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Sandbox Info */}
          <div className="p-4 bg-dark-card border border-dark-border rounded-xl flex gap-3 items-start">
            <ShieldCheck className="h-5 w-5 text-bull-green shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Virtual Authentication</p>
              <p className="text-[10px] text-dark-text-muted leading-relaxed">
                Your session is secured using industry standard JWT. Log out to fully terminate active cookie sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
