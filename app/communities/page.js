'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { communitiesAPI } from '../../lib/api';
import { Users, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import Button from '../../components/ui/Button';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [popularCommunities, setPopularCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    icon: '🚀'
  });

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const data = await communitiesAPI.getAllCommunities(page, 8, search || null);
      setCommunities(data.communities);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularCommunities = async () => {
    try {
      const data = await communitiesAPI.getPopularCommunities(6);
      setPopularCommunities(data.communities);
    } catch (error) {
      console.error('Error fetching popular communities:', error);
    }
  };

  useEffect(() => {
    fetchCommunities();
    if (page === 1) {
      fetchPopularCommunities();
    }
  }, [page]);

  useEffect(() => {
    setPage(1);
    const timer = setTimeout(() => {
      fetchCommunities();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim() || !newCommunity.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('You must be logged in to create a community');
        return;
      }

      await communitiesAPI.createCommunity(
        newCommunity.name,
        newCommunity.description,
        newCommunity.icon
      );

      setNewCommunity({ name: '', description: '', icon: '🚀' });
      setShowCreateModal(false);
      fetchCommunities();
      fetchPopularCommunities();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12 pb-20">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Communities</h1>
          <p className="text-pink-100 text-lg mb-6">
            Join communities of like-minded people and share your interests
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-pink-100 transition-colors"
          >
            <Plus size={20} />
            Create Community
          </button>
        </div>

        {/* Popular Communities */}
        {page === 1 && popularCommunities.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Popular Communities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCommunities.map((community) => (
                <Link
                  key={community._id}
                  href={`/communities/${community._id}`}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="text-5xl mb-4">{community.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{community.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{community.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={16} />
                    <span>{community.memberCount} members</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search communities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Communities List */}
        {loading ? (
          <div className="text-center text-white py-12">Loading communities...</div>
        ) : communities.length === 0 ? (
          <div className="text-center text-white py-12">No communities found</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {communities.map((community) => (
                <Link
                  key={community._id}
                  href={`/communities/${community._id}`}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="text-6xl mb-4">{community.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{community.name}</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">{community.description}</p>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Users size={16} />
                    <span>{community.memberCount} members</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg disabled:opacity-50 hover:bg-pink-100 transition-colors"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg disabled:opacity-50 hover:bg-pink-100 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Community</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Icon (emoji)
                </label>
                <div className="text-4xl p-2 text-center cursor-pointer hover:bg-gray-100 rounded-lg">
                  {newCommunity.icon}
                </div>
                <input
                  type="text"
                  maxLength={2}
                  value={newCommunity.icon}
                  onChange={(e) => setNewCommunity({ ...newCommunity, icon: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 mt-2 text-center text-2xl"
                  placeholder="🚀"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Community Name *
                </label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Enter community name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                  rows="4"
                  placeholder="Describe your community"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCommunity}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
