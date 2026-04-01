import React, { useState, useEffect } from 'react';
import { getStats } from '../api';
import { ActivityChart, UsersChart, MessagesChart } from '../components/Charts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-error">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: 'users',
      color: 'primary'
    },
    {
      title: 'Online Now',
      value: stats?.onlineUsers || 0,
      icon: 'online',
      color: 'success'
    },
    {
      title: 'Total Messages',
      value: stats?.totalMessages || 0,
      icon: 'messages',
      color: 'info'
    },
    {
      title: 'Messages Today',
      value: stats?.messagesToday || 0,
      icon: 'today',
      color: 'warning'
    },
    {
      title: 'Active Users (24h)',
      value: stats?.activeUsersToday || 0,
      icon: 'active',
      color: 'primary'
    },
    {
      title: 'Total Groups',
      value: stats?.totalGroups || 0,
      icon: 'groups',
      color: 'info'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-text mb-6">Dashboard</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-text">User Activity</h2>
          </div>
          <div className="card-body">
            <ActivityChart data={stats?.messagesPerDay || []} />
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-text">Messages per Day</h2>
          </div>
          <div className="card-body">
            <MessagesChart data={stats?.messagesPerDay || []} />
          </div>
        </div>
        
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="font-semibold text-text">New Users per Day</h2>
          </div>
          <div className="card-body">
            <UsersChart data={stats?.usersPerDay || []} />
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-text">Weekly Activity</h2>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Messages this week</span>
                <span className="text-text font-semibold">{stats?.messagesWeek || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Active users this week</span>
                <span className="text-text font-semibold">{stats?.activeUsersWeek || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Total files uploaded</span>
                <span className="text-text font-semibold">{stats?.totalFiles || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Storage used</span>
                <span className="text-text font-semibold">
                  {stats?.storage?.total?.sizeMB || 0} MB
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-text">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              <button className="btn btn-outline w-full justify-center">
                Export All Data
              </button>
              <button className="btn btn-outline w-full justify-center">
                Backup Database
              </button>
              <button className="btn btn-outline w-full justify-center">
                System Health Check
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const icons = {
    users: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    online: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.07 0a5 5 0 010 7.07M12 15a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    ),
    messages: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    today: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    active: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    groups: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  };
  
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    info: 'text-info bg-info/10'
  };
  
  return (
    <div className="card">
      <div className="card-body flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-sm">{title}</p>
          <p className="text-2xl font-bold text-text">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icons[icon]}
        </div>
      </div>
    </div>
  );
}