'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import UserMenu from '../auth/UserMenu';
import AuthModal from '../auth/AuthModal';
import Button from '../ui/Button';

const Header = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-pulse">
                CollabX
              </h1>
              <p className="text-xl text-white/80 font-light max-w-2xl">
                Where stories come alive and communities connect through shared experiences
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {loading ? (
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : user ? (
                <UserMenu />
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  variant="secondary"
                  className="font-semibold"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />
    </>
  );
};

export default Header;