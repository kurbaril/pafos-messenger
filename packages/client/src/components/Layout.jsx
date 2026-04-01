import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePresence } from '../hooks/usePresence';
import { useNotifications } from '../hooks/useNotifications';

export default function Layout() {
  const { user, logout } = useAuth();
  const { status, setStatus } = usePresence();
  const { unreadCount } = useNotifications();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    if (location.pathname === '/profile') return 'Profile';
    if (location.pathname === '/create-group') return 'Create Group';
    return 'PaFos';
  };

  return (
    <div className="h-screen flex flex-col bg-bg">
      {/* Header */}
      <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold text-primary">
            {getPageTitle()}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Status selector */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-hover hover:bg-surface-active transition"
            >
              <span className={`w-2 h-2 rounded-full ${
                status === 'online' ? 'bg-success' :
                status === 'away' ? 'bg-warning' :
                status === 'busy' ? 'bg-error' : 'bg-offline'
              }`} />
              <span className="text-sm capitalize">{status || 'online'}</span>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-surface rounded-lg shadow-lg border border-border z-10">
                {['online', 'away', 'busy'].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatus(s);
                      setShowMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition first:rounded-t-lg last:rounded-b-lg ${
                      status === s ? 'text-primary' : 'text-text'
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      s === 'online' ? 'bg-success' :
                      s === 'away' ? 'bg-warning' : 'bg-error'
                    }`} />
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <Link to="/notifications" className="relative">
            <svg className="w-6 h-6 text-text-secondary hover:text-primary transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full text-xs text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2"
            >
              <img
                src={user?.avatarUrl || '/default-avatar.png'}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border z-10">
                <div className="px-4 py-3 border-b border-border">
                  <p className="font-semibold text-text">{user?.username}</p>
                  <p className="text-xs text-text-secondary">{user?.bio || 'No bio'}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface-hover transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Edit Profile
                </Link>
                <Link
                  to="/create-group"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface-hover transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Group
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-surface-hover transition rounded-b-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}