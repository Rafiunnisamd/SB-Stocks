import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Upper header */}
      <div className="h-8 w-48 bg-dark-border rounded"></div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-dark-card border border-dark-border p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-dark-border rounded"></div>
              <div className="h-7 w-32 bg-dark-border rounded"></div>
            </div>
            <div className="h-3 w-16 bg-dark-border rounded"></div>
          </div>
        ))}
      </div>

      {/* Main Grid: Chart & Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Skeleton */}
        <div className="lg:col-span-2 rounded-xl bg-dark-card border border-dark-border p-6 h-[400px] flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-dark-border rounded"></div>
            <div className="h-8 w-24 bg-dark-border rounded"></div>
          </div>
          <div className="h-[280px] bg-dark-bg/60 rounded border border-dark-border/40 flex items-center justify-center">
            <span className="text-dark-text-muted text-xs">Simulating performance indices...</span>
          </div>
        </div>

        {/* Holdings / Watchlist Skeleton */}
        <div className="rounded-xl bg-dark-card border border-dark-border p-6 h-[400px] flex flex-col justify-between">
          <div className="h-5 w-40 bg-dark-border rounded"></div>
          <div className="space-y-4 flex-1 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="h-9 w-9 rounded-lg bg-dark-border"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-12 bg-dark-border rounded"></div>
                    <div className="h-3 w-20 bg-dark-border rounded"></div>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-4 w-16 bg-dark-border rounded"></div>
                  <div className="h-3 w-10 bg-dark-border rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
