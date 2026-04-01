import React, { useState, useEffect } from 'react';
import { getUsers, banUser, unbanUser, getUserDetails } from '../api';
import { formatMessageTime } from '../utils/chartHelpers';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banning, setBanning] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;
    
    setBanning(true);
    try {
      await banUser(selectedUser.id, banReason);
      toast.success(`User @${selectedUser.username} banned`);
      setShowBanModal(false);
      setBanReason('');
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to ban user');
    } finally {
      setBanning(false);
    }
  };

  const handleUnbanUser = async (user) => {
    try {
      await unbanUser(user.id);
      toast.success(`User @${user.username} unbanned`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to unban user');
    }
  };

  const handleViewUser = async (user) => {
    try {
      const details = await getUserDetails(user.id);
      setSelectedUser(details);
    } catch (err) {
      toast.error('Failed to load user details');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-text">Users</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-surface-hover border border-border rounded-lg focus:border-primary focus:outline-none text-text w-64"
          />
          <button
            onClick={fetchUsers}
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
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Messages</th>
              <th>Groups</th>
              <th>Joined</th>
              <th>Last Seen</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-text-secondary py-8">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatarUrl || '/default-avatar.png'}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-text">@{user.username}</div>
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-xs text-primary hover:underline"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-warning' : 'badge-info'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.isBanned ? (
                      <span className="badge badge-error">Banned</span>
                    ) : (
                      <span className="badge badge-success">Active</span>
                    )}
                  </td>
                  <td className="text-text">{user._count?.sentMessages || 0}</td>
                  <td className="text-text">{user._count?.groups || 0}</td>
                  <td className="text-text-secondary text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="text-text-secondary text-sm">
                    {user.lastSeen ? formatMessageTime(user.lastSeen) : 'Never'}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {user.isBanned ? (
                        <button
                          onClick={() => handleUnbanUser(user)}
                          className="btn btn-outline text-sm py-1 px-3"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBanModal(true);
                          }}
                          className="btn btn-danger text-sm py-1 px-3"
                          disabled={user.role === 'ADMIN'}
                        >
                          Ban
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-text">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-text-secondary hover:text-text"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUser.avatarUrl || '/default-avatar.png'}
                    alt={selectedUser.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-text">@{selectedUser.username}</div>
                    <div className="text-sm text-text-secondary">{selectedUser.bio || 'No bio'}</div>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between py-1">
                    <span className="text-text-secondary">ID:</span>
                    <span className="text-text font-mono text-sm">{selectedUser.id}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-secondary">Role:</span>
                    <span className="text-text">{selectedUser.role}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-secondary">Joined:</span>
                    <span className="text-text">{new Date(selectedUser.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-secondary">Last Seen:</span>
                    <span className="text-text">
                      {selectedUser.lastSeen ? new Date(selectedUser.lastSeen).toLocaleString() : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-secondary">Total Messages:</span>
                    <span className="text-text">{selectedUser._count?.sentMessages || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && (
        <div className="modal-overlay" onClick={() => setShowBanModal(false)}>
          <div className="modal-content max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-5">
              <h2 className="text-lg font-semibold text-text mb-4">
                Ban User @{selectedUser?.username}
              </h2>
              <p className="text-text-secondary mb-4">
                This user will not be able to log in or send messages.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 bg-surface-hover border border-border rounded-lg focus:border-primary focus:outline-none text-text"
                  placeholder="Enter reason for ban..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBanUser}
                  disabled={banning}
                  className="btn btn-danger"
                >
                  {banning ? 'Banning...' : 'Ban User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}