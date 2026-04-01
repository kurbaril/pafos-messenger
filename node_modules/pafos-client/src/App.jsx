import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import Layout from './components/Layout';
import Login from './components/Login';
import ChatWindow from './components/ChatWindow';
import ProfileEditor from './components/ProfileEditor';
import GroupCreate from './components/GroupCreate';
import SearchResults from './components/SearchResults';
import { Toaster } from 'react-hot-toast';

function App() {
  const { user, loading, checkAuth, logout } = useAuth();
  const { socket, connect, disconnect } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      connect();
    }
    return () => {
      if (user) {
        disconnect();
      }
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading PaFos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout socket={socket} user={user} onLogout={logout} />}>
        <Route index element={<ChatWindow socket={socket} user={user} />} />
        <Route path="chat/:chatId" element={<ChatWindow socket={socket} user={user} />} />
        <Route path="profile" element={<ProfileEditor user={user} />} />
        <Route path="create-group" element={<GroupCreate />} />
        <Route path="search" element={<SearchResults />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;