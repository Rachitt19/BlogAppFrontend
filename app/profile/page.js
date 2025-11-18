'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { postsAPI, authAPI, communitiesAPI } from '../../lib/api';
import { Edit2, Trash2, Eye, MessageCircle, Heart, Users, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState({ displayName: '', photoURL: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [likedPage, setLikedPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [likedPagination, setLikedPagination] = useState({});
  const [activeTab, setActiveTab] = useState('posts');
  const itemsPerPage = 5;

  // Load user basic info on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');

    if (!token || !userId) {
      router.push('/');
      return;
    }

    const userData = storedUser ? JSON.parse(storedUser) : {};
    setUser(userData);
    setFormData({
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || ''
    });
  }, [router]);

  // Load data based on active tab
  useEffect(() => {
    const loadTabData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        console.log('Loading tab data for user:', userId, 'Tab:', activeTab);
        if (!userId) {
          console.log('No user ID found');
          return;
        }

        setLoading(true);

        if (activeTab === 'posts') {
          console.log('Fetching user posts...');
          const postsData = await postsAPI.getUserPosts(userId, currentPage, itemsPerPage);
          console.log('User posts response:', postsData);
          setPosts(postsData.posts || []);
          setPagination(postsData.pagination || {});
        } 
        else if (activeTab === 'liked') {
          console.log('Fetching liked posts...');
          const likedData = await postsAPI.getLikedPosts(userId, likedPage, itemsPerPage);
          console.log('Liked posts response:', likedData);
          setLikedPosts(likedData.posts || []);
          setLikedPagination(likedData.pagination || {});
        }
        else if (activeTab === 'communities') {
          console.log('Fetching communities...');
          const communitiesData = await communitiesAPI.getUserCommunities(userId);
          console.log('Communities response:', communitiesData);
          setUserCommunities(communitiesData.communities || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading tab data:', error);
        setLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, currentPage, likedPage]);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(formData.displayName, formData.photoURL);
      
      if (response.success) {
        // Update local state
        setUser(formData);
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(formData));
        setEditingProfile(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postsAPI.deletePost(postId);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center text-white">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-20 pb-40">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {!editingProfile ? (
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.displayName || 'User'}</h1>
                  <p className="text-gray-600 mb-4">{user?.email}</p>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Photo URL
                    </label>
                    <input
                      type="text"
                      value={formData.photoURL}
                      onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={handleUpdateProfile}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <div className="md:flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{pagination.total || 0}</div>
              <div className="text-sm text-gray-600">Posts Published</div>
            </div>
          </div>
        </div>

        {/* User's Posts Section */}
        <div>
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-white/20 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('posts');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'text-white border-b-2 border-white'
                  : 'text-pink-100 hover:text-white'
              }`}
            >
              Published Stories
            </button>
            <button
              onClick={() => {
                setActiveTab('liked');
                setLikedPage(1);
              }}
              className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'liked'
                  ? 'text-white border-b-2 border-white'
                  : 'text-pink-100 hover:text-white'
              }`}
            >
              Liked Stories
            </button>
            <button
              onClick={() => {
                setActiveTab('communities');
              }}
              className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'communities'
                  ? 'text-white border-b-2 border-white'
                  : 'text-pink-100 hover:text-white'
              }`}
            >
              My Communities
            </button>
          </div>

          {activeTab === 'posts' ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">Your Published Stories</h2>

              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <p className="text-gray-600 text-lg mb-4">You haven't published any stories yet.</p>
                  <Link href="/">
                    <Button variant="gradient">
                      Start Writing
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex-1">
                          <Link href={`/blog/${post._id}`}>
                            <h3 className="text-xl font-bold text-gray-800 hover:text-purple-600 cursor-pointer transition-colors mb-2">
                              {post.title}
                            </h3>
                          </Link>
                          <p className="text-gray-600 line-clamp-2 mb-3">
                            {post.content.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                              {post.category}
                            </span>
                            <span>
                              {new Date(post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 border-t border-gray-200 pt-4">
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

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/blog/${post._id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            View
                          </Button>
                        </Link>
                        <Link href={`/blog/${post._id}/edit`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Edit2 size={16} className="mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
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
            </>
          ) : activeTab === 'liked' ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">Stories You Liked</h2>

              {likedPosts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <p className="text-gray-600 text-lg mb-4">You haven't liked any stories yet.</p>
                  <Link href="/">
                    <Button variant="gradient">
                      Explore Stories
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {likedPosts.map((post) => (
                    <div
                      key={post._id}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex-1">
                          <Link href={`/blog/${post._id}`}>
                            <h3 className="text-xl font-bold text-gray-800 hover:text-purple-600 cursor-pointer transition-colors mb-2">
                              {post.title}
                            </h3>
                          </Link>
                          <p className="text-gray-600 line-clamp-2 mb-3">
                            {post.content.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                              {post.category}
                            </span>
                            <span>
                              By {post.author?.displayName || 'Unknown'}
                            </span>
                            <span>
                              {new Date(post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 border-t border-gray-200 pt-4">
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

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/blog/${post._id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {likedPagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      {Array.from({ length: likedPagination.pages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setLikedPage(page)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            likedPage === page
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
            </>
          ) : activeTab === 'communities' ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">My Communities</h2>

              {userCommunities.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <p className="text-gray-600 text-lg mb-4">You haven't joined any communities yet.</p>
                  <Link href="/communities">
                    <Button variant="gradient">
                      Explore Communities
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userCommunities.map((community) => (
                    <Link href={`/communities/${community._id}`} key={community._id}>
                      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 cursor-pointer h-full">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-4xl">{community.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                              {community.name}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {community.description}
                            </p>
                          </div>
                        </div>

                        {/* Community Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-200 pt-4">
                          <div className="flex items-center gap-1">
                            <Users size={16} />
                            <span>{community.memberCount || 0} members</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
