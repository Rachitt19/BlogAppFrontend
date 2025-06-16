import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Header />
      <main className="max-w-7xl mx-auto px-4 pb-20">
        {children}
      </main>
    </div>
  );
};

export default Layout;
