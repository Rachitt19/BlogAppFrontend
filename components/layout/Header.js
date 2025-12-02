'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import UserMenu from '../auth/UserMenu';
import AuthModal from '../auth/AuthModal';
import Button from '../ui/Button';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

const Header = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="flex justify-between items-start mb-8">
            <Link href="/" className="flex-1 hover:opacity-80 transition-opacity">
              <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-pulse">
                CollabX
              </h1>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/communities" className="text-white hover:text-pink-200 font-semibold transition-colors">
                Communities
              </Link>

              {user && (
                <Link href="/chat" className="text-white hover:text-pink-200 transition-colors relative group">
                  <div className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <MessageCircle size={24} />
                    {/* Unread badge placeholder - can be connected to real state later */}
                    {/* <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-indigo-900"></span> */}
                  </div>
                </Link>
              )}

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