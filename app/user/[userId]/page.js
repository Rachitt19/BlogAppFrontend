'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/layout/Header';
import { postsAPI } from '../../../lib/api';
import { MessageCircle, Heart, Eye } from 'lucide-react';
import Link from 'next/link';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const itemsPerPage = 10;

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Load user's posts
        const postsData = await postsAPI.getUserPosts(userId, currentPage, itemsPerPage);
        setPosts(postsData.posts || []);
        setPagination(postsData.pagination || {});

        // Extract user info from the first post's author field
        if (postsData.posts && postsData.posts.length > 0) {
          setUser(postsData.posts[0].author);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center text-white">Loading profile...</div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">User not found</h1>
            <Link href="/" className="text-pink-200 hover:text-pink-100">
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-20 pb-40">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {user.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.displayName}</h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{pagination.total || 0}</div>
                  <div className="text-sm text-gray-600">Posts Published</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            {user.displayName}'s Stories
          </h2>

          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">
                {user.displayName} hasn't published any stories yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link key={post._id} href={`/blog/${post._id}`}>
                  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 cursor-pointer group">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {post.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors mb-2 line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 line-clamp-2 mb-4">
                          {post.content?.substring(0, 150) || 'No content available'}...
                        </p>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{post.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <Eye size={16} />
                            <span>{post.views || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart size={16} />
                            <span>{post.likes?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle size={16} />
                            <span>{post.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPage === page
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
