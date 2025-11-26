import React from 'react';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-bg text-white flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E1E2F',
            color: '#fff',
            border: '1px solid #333',
          },
          success: {
            iconTheme: {
              primary: '#00F0FF',
              secondary: '#1E1E2F',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF0033',
              secondary: '#1E1E2F',
            },
          },
        }}
      />
    </div>
  );
};

export default Layout;
