import React, { useState, useEffect } from 'react';
import { getStats, getAdminLogs } from '../api';
import { ActivityChart, MessagesChart, UsersChart, Heatmap } from '../components/Charts';
import { formatMessageTime } from '../utils/chartHelpers';
import toast from 'react-hot-toast';

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
    fetchLogs();
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

  const fetchLogs = async () => {
    try {
      const data = await getAdminLogs({ limit: 50 });
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getActionBadge = (action) => {
    const styles = {
      BAN_USER: 'badge-error',
      UNBAN_USER: 'badge-success',
      VIEW_CHAT: 'badge-info',
      RESTORE_MESSAGE: 'badge-warning',
      DELETE_MESSAGE: 'badge-error',
      VIEW_STATS: 'badge-info'
    };
    return styles[action] || 'badge-info';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-text mb-6">Advanced Statistics</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'heatmap'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          Activity Heatmap
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'logs'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          Admin Logs
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Messages per User"
              value={stats?.totalUsers ? (stats.totalMessages / stats.totalUsers).toFixed(1) : 0}
              suffix="avg"
              icon="chart"
            />
            <MetricCard
              title="Messages per Group"
              value={stats?.totalGroups ? (stats.totalMessages / stats.totalGroups).toFixed(1) : 0}
              suffix="avg"
              icon="group"
            />
            <MetricCard
              title="Active Rate"
              value={stats?.totalUsers ? ((stats.activeUsersToday / stats.totalUsers) * 100).toFixed(1) : 0}
              suffix="%"
              icon="activity"
            />
            <MetricCard
              title="Messages per Day"
              value={stats?.messagesToday || 0}
              suffix="today"
              icon="message"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-text">Messages Trend (7 days)</h2>
              </div>
              <div className="card-body">
                <MessagesChart data={stats?.messagesPerDay || []} />
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-text">User Growth (7 days)</h2>
              </div>
              <div className="card-body">
                <UsersChart data={stats?.usersPerDay || []} />
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-text">Detailed Statistics</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatRow label="Total Users" value={stats?.totalUsers} />
                <StatRow label="Total Messages" value={stats?.totalMessages} />
                <StatRow label="Total Groups" value={stats?.totalGroups} />
                <StatRow label="Total Chats" value={stats?.totalChats} />
                <StatRow label="Total Files Uploaded" value={stats?.totalFiles} />
                <StatRow label="Online Users" value={stats?.onlineUsers} />
                <StatRow label="Active Today" value={stats?.activeUsersToday} />
                <StatRow label="Active This Week" value={stats?.activeUsersWeek} />
                <StatRow label="Messages Today" value={stats?.messagesToday} />
                <StatRow label="Messages This Week" value={stats?.messagesWeek} />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'heatmap' && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-text">Activity Heatmap</h2>
            <p className="text-sm text-text-secondary mt-1">Message frequency by hour and day of week</p>
          </div>
          <div className="card-body">
            <Heatmap data={stats?.messagesPerDay || []} />
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="font-semibold text-text">Admin Actions Log</h2>
            <p className="text-sm text-text-secondary mt-1">Recent admin activities</p>
          </div>
          <div className="overflow-x-auto">
            {logsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                No admin logs found
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Metadata</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-text">@{log.adminUsername}</td>
                      <td>
                        <span className={`badge ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="text-text-secondary font-mono text-sm">
                        {log.targetId ? log.targetId.substring(0, 8) : '-'}
                      </td>
                      <td className="text-text-secondary text-sm max-w-xs truncate">
                        {log.metadata ? JSON.stringify(log.metadata).substring(0, 50) : '-'}
                      </td>
                      <td className="text-text-secondary text-sm">
                        {formatMessageTime(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, suffix, icon }) {
  const icons = {
    chart: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    group: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    activity: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    message: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  };

  return (
    <div className="card">
      <div className="card-body flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-sm">{title}</p>
          <p className="text-2xl font-bold text-text">
            {value} <span className="text-sm text-text-muted">{suffix}</span>
          </p>
        </div>
        <div className="p-2 bg-primary/10 rounded-full text-primary">
          {icons[icon]}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text font-semibold">{value?.toLocaleString() || 0}</span>
    </div>
  );
}