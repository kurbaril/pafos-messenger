import React, { useState, useEffect } from 'react';
import { getDeletedMessages, restoreMessage } from '../api';
import { formatMessageTime } from '../utils/chartHelpers';
import toast from 'react-hot-toast';

export default function Messages() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    fetchDeletedMessages();
  }, []);

  const fetchDeletedMessages = async () => {
    try {
      const data = await getDeletedMessages();
      setLogs(data.logs || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (log) => {
    setRestoring(true);
    try {
      await restoreMessage(log.id);
      toast.success('Message restored successfully');
      fetchDeletedMessages();
      setSelectedLog(null);
    } catch (err) {
      toast.error(err.message || 'Failed to restore message');
    } finally {
      setRestoring(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.messageData?.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.deleter?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.messageSender?.username?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold text-text">Deleted Messages</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by content or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-surface-hover border border-border rounded-lg focus:border-primary focus:outline-none text-text w-80"
          />
          <button
            onClick={fetchDeletedMessages}
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
              <th>Message Content</th>
              <th>Sender</th>
              <th>Deleted By</th>
              <th>Deleted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-text-secondary py-8">
                  No deleted messages found
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="max-w-md">
                    <div className="text-text truncate">
                      {log.messageData?.content || (log.messageData?.fileUrl ? '📎 File' : 'No content')}
                    </div>
                    {log.messageData?.fileUrl && (
                      <a
                        href={log.messageData.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View file
                      </a>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="text-text">@{log.messageSender?.username}</span>
                      <span className="text-xs text-text-muted">
                        ({new Date(log.messageData?.createdAt).toLocaleDateString()})
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="text-text">@{log.deleter?.username}</div>
                  </td>
                  <td className="text-text-secondary text-sm">
                    {formatMessageTime(log.deletedAt)}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="btn btn-outline text-sm py-1 px-3"
                    >
                      View & Restore
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Message Details Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-text">Deleted Message Details</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-text-secondary hover:text-text"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-surface-hover rounded-lg p-4">
                  <div className="text-xs text-text-secondary mb-2">Original Message</div>
                  <div className="text-text whitespace-pre-wrap">
                    {selectedLog.messageData?.content || '(No text content)'}
                  </div>
                  {selectedLog.messageData?.fileUrl && (
                    <div className="mt-2">
                      <a
                        href={selectedLog.messageData.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Download file
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-hover rounded-lg p-3">
                    <div className="text-xs text-text-secondary">Sender</div>
                    <div className="text-text font-medium">@{selectedLog.messageSender?.username}</div>
                    <div className="text-xs text-text-muted mt-1">
                      ID: {selectedLog.messageData?.senderId}
                    </div>
                  </div>
                  <div className="bg-surface-hover rounded-lg p-3">
                    <div className="text-xs text-text-secondary">Deleted By</div>
                    <div className="text-text font-medium">@{selectedLog.deleter?.username}</div>
                    <div className="text-xs text-text-muted mt-1">
                      {formatMessageTime(selectedLog.deletedAt)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-surface-hover rounded-lg p-3">
                  <div className="text-xs text-text-secondary">Message ID</div>
                  <div className="text-text font-mono text-sm break-all">{selectedLog.messageId}</div>
                </div>
                
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="btn btn-outline"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleRestore(selectedLog)}
                    disabled={restoring}
                    className="btn btn-primary"
                  >
                    {restoring ? 'Restoring...' : 'Restore Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}