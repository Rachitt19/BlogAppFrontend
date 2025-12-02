'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import UserMenu from '../auth/UserMenu';
import AuthModal from '../auth/AuthModal';
import Button from '../ui/Button';
import Link from 'next/link';
import { MessageCircle, Search } from 'lucide-react';
import { chatAPI } from '../../lib/api';

const Header = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  React.useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const res = await chatAPI.getUnreadCount();
          setUnreadCount(res.count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };

      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);

      // Listen for messages read event
      const handleMessagesRead = () => {
        fetchUnreadCount();
      };
      window.addEventListener('messagesRead', handleMessagesRead);

      return () => {
        clearInterval(interval);
        window.removeEventListener('messagesRead', handleMessagesRead);
      };
    }
  }, [user]);

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
                <div className="flex items-center gap-2">
                  <Link href="/search" className="text-white hover:text-pink-200 transition-colors relative group">
                    <div className="p-2 rounded-full hover:bg-white/10 transition-colors">
                      <Search size={24} />
                    </div>
                  </Link>
                  <Link href="/chat" className="text-white hover:text-pink-200 transition-colors relative group">
                    <div className="p-2 rounded-full hover:bg-white/10 transition-colors">
                      <MessageCircle size={24} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-indigo-900">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
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