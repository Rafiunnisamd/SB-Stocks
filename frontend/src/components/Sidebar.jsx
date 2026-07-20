import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Star, Briefcase, History, UserCircle, LineChart } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Market', path: '/market', icon: LineChart },
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { name: 'Watchlist', path: '/watchlist', icon: Star },
    { name: 'Transactions', path: '/transactions', icon: History },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <aside className="w-64 border-r border-dark-border bg-dark-card min-h-[calc(100vh-4rem)] flex flex-col justify-between hidden md:flex">
      <div className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-bull-green/10 text-bull-green border-l-4 border-bull-green pl-3'
                    : 'text-dark-text-muted hover:text-white hover:bg-dark-bg/60'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-dark-border">
        <div className="rounded-lg bg-dark-bg/50 border border-dark-border p-3">
          <p className="text-xs text-dark-text-muted font-medium mb-1">Stock Trading Hours</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-bull-green animate-pulse"></span>
            <p className="text-xs font-semibold text-white">9:30 AM - 4:00 PM EST</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
