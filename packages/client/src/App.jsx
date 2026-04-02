import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { useNotifications } from './hooks/useNotifications';
import Layout from './components/Layout';
import Login from './components/Login';
import ChatWindow from './components/ChatWindow';
import ProfileEditor from './components/ProfileEditor';
import GroupCreate from './components/GroupCreate';
import NotificationToast from './components/NotificationToast';

function App() {
  const { user, loading, checkAuth } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setInitialized(true));
  }, []);

  useSocket(user);
  useNotifications(user);

  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading PaFos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-lg)'
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'var(--color-text-inverse)'
            }
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'var(--color-text-inverse)'
            }
          }
        }}
      />
      <NotificationToast />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/chats" replace />} />
          <Route path="chats" element={<ChatWindow />} />
          <Route path="chats/:chatId" element={<ChatWindow />} />
          <Route path="profile" element={<ProfileEditor />} />
          <Route path="create-group" element={<GroupCreate />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
