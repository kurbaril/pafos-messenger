import React, { useState, useEffect } from 'react';
import { getBannedIPs, unbanIP } from '../api';
import { formatMessageTime } from '../utils/chartHelpers';
import toast from 'react-hot-toast';

export default function BannedIPs() {
  const [bannedIPs, setBannedIPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBannedIPs();
  }, []);

  const fetchBannedIPs = async () => {
    try {
      const data = await getBannedIPs();
      setBannedIPs(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (ip) => {
    try {
      await unbanIP(ip);
      toast.success(`IP ${ip} unbanned`);
      fetchBannedIPs();
    } catch (err) {
      toast.error(err.message || 'Failed to unban IP');
    }
  };

  const filteredIPs = bannedIPs.filter(entry =>
    entry.ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Banned IPs</h1>
          <p className="text-text-secondary mt-1">
            IPs temporarily banned due to too many failed login attempts
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search IP or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-surface-hover border border-border rounded-lg focus:border-primary focus:outline-none text-text w-64"
          />
          <button
            onClick={fetchBannedIPs}
            className="btn btn-outline"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-error mb-6">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th>IP Address</th>
              <th>Failed Attempts</th>
              <th>Status</th>
              <th>Banned At</th>
              <th>Expires At</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIPs.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-text-secondary py-8">
                  No banned IPs found
                </td>
              </tr>
            ) : (
              filteredIPs.map((entry) => {
                const expired = isExpired(entry.expiresAt);
                return (
                  <tr key={entry.id} className={expired ? 'opacity-60' : ''}>
                    <td className="font-mono text-text">{entry.ip}</td>
                    <td className="text-text">{entry.attempts}</td>
                    <td>
                      {expired ? (
                        <span className="badge badge-success">Expired</span>
                      ) : (
                        <span className="badge badge-error">Banned</span>
                      )}
                    </td>
                    <td className="text-text-secondary text-sm">
                      {new Date(entry.bannedAt).toLocaleString()}
                    </td>
                    <td className="text-text-secondary text-sm">
                      {entry.expiresAt ? new Date(entry.expiresAt).toLocaleString() : 'Manual unban required'}
                    </td>
                    <td className="text-text-secondary text-sm max-w-xs truncate">
                      {entry.reason || '-'}
                    </td>
                    <td>
                      {!expired && (
                        <button
                          onClick={() => handleUnban(entry.ip)}
                          className="btn btn-outline text-sm py-1 px-3"
                        >
                          Unban
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {bannedIPs.length === 0 && !loading && (
        <div className="card mt-6 bg-surface-hover">
          <div className="card-body text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="text-text font-medium mb-1">No Banned IPs</h3>
            <p className="text-text-secondary text-sm">
              All IPs are currently allowed. Bans are automatically applied after 5 failed login attempts.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 card">
        <div className="card-header">
          <h2 className="font-semibold text-text">About IP Bans</h2>
        </div>
        <div className="card-body">
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              IPs are automatically banned after 5 failed login attempts within 15 minutes.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Bans last for 30 minutes by default, after which the IP is automatically unbanned.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Successful login resets the failed attempt counter for that IP.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              You can manually unban an IP at any time using the Unban button.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}