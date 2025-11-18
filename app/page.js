'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import CategoryFilter from '../components/blog/CategoryFilter';
import BlogGrid from '../components/blog/BlogGrid';
import CreatePostModal from '../components/blog/CreatePostModal';
import Button from '../components/ui/Button';
import { postsAPI } from '../lib/api';
import PostViewModal from '../components/blog/PostViewModal.js'

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [sortBy, setSortBy] = useState('-createdAt');

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const category = activeCategory === 'all' ? null : activeCategory;
      console.log('Loading posts with sort:', sortBy, 'page:', currentPage, 'category:', category);
      const response = await postsAPI.getAllPosts(currentPage, 10, category, searchTerm, sortBy);
      
      console.log('API Response:', response);
      if (response.success) {
        setPosts(response.posts || []);
        setPagination(response.pagination || {});
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, currentPage, sortBy, searchTerm]);

  // Load posts when any dependency changes
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    setCurrentPage(1);
    
    try {
      const category = activeCategory === 'all' ? null : activeCategory;
      const response = await postsAPI.getAllPosts(1, 10, category, query, sortBy);
      
      if (response.success) {
        setPosts(response.posts || []);
        setPagination(response.pagination || {});
      }
    } catch (error) {
      console.error('Failed to search posts:', error);
    }
  };

  const handleSubmit = (newPost) => {
    // Add new post to the top of the list
    setPosts([newPost, ...posts]);
    setCurrentPage(1);
  };

  const handleLike = async (postId) => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      alert('Please login to like posts');
      return;
    }

    try {
      // Call API to like/unlike the post
      const response = await postsAPI.likePost(postId);
      
      if (response.success && response.post) {
        // Update the specific post with the response from server
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === postId ? response.post : post
          )
        );
      } else {
        console.error('Like failed');
        alert('Failed to update like');
      }
    } catch (error) {
      console.error('Failed to like post:', error);
      alert('Failed to update like');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Header />
      <main className="max-w-7xl mx-auto px-4 pb-20">

        <div className="flex flex-col lg:flex-row gap-6 mb-6 items-center justify-between mt-3">
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full lg:max-w-sm px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <Button
            onClick={() => {
              const token = localStorage.getItem('authToken');
              if (!token) {
                alert('Please login to create a post');
                return;
              }
              setShowModal(true);
            }}
            variant="primary"
            size="lg"
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Share Your Story
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center justify-between">
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={(category) => {
              console.log('Category changed to:', category);
              setActiveCategory(category);
              setCurrentPage(1);
            }}
          />
          
          <select
            value={sortBy}
            onChange={(e) => {
              const newSort = e.target.value;
              console.log('Sort dropdown changed to:', newSort);
              setSortBy(newSort);
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-md bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="-createdAt" className="text-gray-800">Newest First</option>
            <option value="createdAt" className="text-gray-800">Oldest First</option>
            <option value="-views" className="text-gray-800">Most Viewed</option>
            <option value="-likes" className="text-gray-800">Most Liked</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-white py-12">
            <div className="animate-spin inline-block">Loading stories...</div>
          </div>
        )}

        {/* Blog Posts */}
        {!loading && (
          <>
            <BlogGrid posts={posts} onLike={handleLike} onPostClick={setSelectedPost} />
            
            {posts.length === 0 && (
              <div className="text-center text-white py-12">
                <p className="text-lg">No stories found. Start the first one!</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      currentPage === page
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {selectedPost && (
          <PostViewModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}

