'use client';

import React from 'react';

const Header = () => {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-pulse">
          StorySphere
        </h1>
        <p className="text-xl text-white/80 font-light max-w-2xl mx-auto">
          Where stories come alive and communities connect through shared experiences
        </p>
      </div>
    </header>
  );
};

export default Header;