import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, TrendingUp, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    setLoading(true);
    // Simulate API Call for password recovery
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
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
          <h2 className="text-2xl font-extrabold text-white tracking-tight">FORGOT PASSWORD?</h2>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-bull-green/10 flex items-center justify-center text-bull-green">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Check your email</h3>
              <p className="text-sm text-dark-text-muted px-4 leading-relaxed">
                If the email is registered on SB Stocks, you will receive link instructions to reset your password shortly.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-bull-green hover:underline mt-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <p className="text-dark-text-muted text-sm text-center leading-relaxed">
              No worries! Just enter your registered email address below, and we'll send you instructions to reset it.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/90 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-2.5 rounded-lg bg-dark-bg border text-sm text-white placeholder:text-dark-text-muted outline-none transition-all duration-200 focus:border-bull-green/50 focus:ring-1 focus:ring-bull-green/20 ${
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
                    <Mail className="h-4 w-4" />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-dark-text-muted hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
