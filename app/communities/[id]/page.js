'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/layout/Header';
import BlogCard from '../../../components/blog/BlogCard';
import { communitiesAPI, forumAPI } from '../../../lib/api';
import { Users, ArrowLeft, TrendingUp, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function CommunityPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id;

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  const [activeTab, setActiveTab] = useState('posts');
  const [threads, setThreads] = useState([]);
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const [threadsPagination, setThreadsPagination] = useState({});

  useEffect(() => {
    const loadCommunity = async () => {
      try {
        const data = await communitiesAPI.getCommunity(communityId);
        setCommunity(data.community);
        setPosts(data.community.posts || []);

        // Check if user is already a member
        const userId = localStorage.getItem('userId');
        if (userId && data.community.members.some(m => m._id === userId)) {
          setIsJoined(true);
        }
      } catch (error) {
        console.error('Failed to load community:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCommunity();
  }, [communityId]);

  useEffect(() => {
    if (activeTab === 'discussions') {
      loadThreads();
    }
  }, [activeTab, communityId]);

  const loadThreads = async () => {
    try {
      const data = await forumAPI.getThreads(communityId);
      setThreads(data.threads);
      setThreadsPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load threads:', error);
    }
  };

  const handleCreateThread = async () => {
    if (!newThread.title.trim() || !newThread.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await forumAPI.createThread(communityId, newThread.title, newThread.content);
      setNewThread({ title: '', content: '' });
      setShowCreateThread(false);
      loadThreads();
    } catch (error) {
      console.error('Failed to create thread:', error);
      alert('Failed to create thread');
    }
  };


  const handleJoinCommunity = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }

      await communitiesAPI.joinCommunity(communityId);
      setIsJoined(true);

      // Update community data
      const data = await communitiesAPI.getCommunity(communityId);
      setCommunity(data.community);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      await communitiesAPI.leaveCommunity(communityId);
      setIsJoined(false);

      // Update community data
      const data = await communitiesAPI.getCommunity(communityId);
      setCommunity(data.community);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center text-white">Loading community...</div>
        </main>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center text-white">Community not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12 pb-20">
        {/* Back Button */}
        <Link href="/communities" className="inline-flex items-center gap-2 text-white hover:text-pink-200 mb-6 transition-colors">
          <ArrowLeft size={20} />
          Back to Communities
        </Link>

        {/* Community Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <div className="text-7xl">{community.icon}</div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{community.name}</h1>
                <p className="text-gray-600 text-lg mb-4">{community.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={20} />
                    <span className="font-semibold">{community.memberCount} members</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold">{posts.length} posts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Join/Leave Button */}
            <button
              onClick={isJoined ? handleLeaveCommunity : handleJoinCommunity}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${isJoined
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                }`}
            >
              {isJoined ? 'Leave Community' : 'Join Community'}
            </button>
          </div>

          {/* Rules */}
          {community.rules && community.rules.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-800 mb-3">Community Rules</h3>
              <ul className="space-y-2">
                {community.rules.map((rule, index) => (
                  <li key={index} className="text-gray-600 flex items-start">
                    <span className="mr-3">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/20">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'posts'
              ? 'text-white border-b-2 border-white'
              : 'text-pink-100 hover:text-white'
              }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('discussions')}
            className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'discussions'
              ? 'text-white border-b-2 border-white'
              : 'text-pink-100 hover:text-white'
              }`}
          >
            Discussions
          </button>
        </div>

        {activeTab === 'posts' ? (
          /* Posts Section */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Posts</h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-white/30 bg-white/10 text-white font-semibold focus:outline-none"
              >
                <option value="newest" className="text-gray-800">Newest First</option>
                <option value="oldest" className="text-gray-800">Oldest First</option>
                <option value="most-liked" className="text-gray-800">Most Liked</option>
                <option value="most-viewed" className="text-gray-800">Most Viewed</option>
              </select>
            </div>
            {posts && posts.length > 0 ? (
              <div className="space-y-6">
                {posts.sort((a, b) => {
                  switch (sortBy) {
                    case 'oldest':
                      return new Date(a.createdAt) - new Date(b.createdAt);
                    case 'most-liked':
                      return (b.likes?.length || 0) - (a.likes?.length || 0);
                    case 'most-viewed':
                      return (b.views || 0) - (a.views || 0);
                    case 'newest':
                    default:
                      return new Date(b.createdAt) - new Date(a.createdAt);
                  }
                }).map((post) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center">
                <p className="text-gray-600">No posts in this community yet</p>
              </div>
            )}
          </div>
        ) : (
          /* Discussions Section */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Discussions</h2>
              <button
                onClick={() => setShowCreateThread(true)}
                className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-pink-100 transition-colors"
              >
                Start Discussion
              </button>
            </div>

            {threads.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <p className="text-gray-600">No discussions yet. Be the first to start one!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {threads.map((thread) => (
                  <Link href={`/forums/${thread._id}`} key={thread._id}>
                    <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{thread.title}</h3>
                      <p className="text-gray-600 line-clamp-2 mb-4">{thread.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">
                            {thread.author?.displayName?.charAt(0).toUpperCase()}
                          </div>
                          <span>{thread.author?.displayName}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={16} />
                          <span>{thread.commentCount} comments</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Thread Modal */}
      {showCreateThread && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Start Discussion</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Discussion title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newThread.content}
                  onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                  rows="6"
                  placeholder="What's on your mind?"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateThread(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateThread}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
