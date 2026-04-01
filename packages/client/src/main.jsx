import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A1A1A',
            color: '#E5E5E5',
            borderRadius: '12px',
            border: '1px solid #2A2A2A'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#1A1A1A'
            }
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#1A1A1A'
            }
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);