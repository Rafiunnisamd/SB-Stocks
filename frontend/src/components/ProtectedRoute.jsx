import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-bg text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-bull-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-dark-text-muted font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
