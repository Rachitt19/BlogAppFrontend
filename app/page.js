'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import CategoryFilter from '../components/blog/CategoryFilter';
import BlogGrid from '../components/blog/BlogGrid';
import CreatePostModal from '../components/blog/CreatePostModal';
import Button from '../components/ui/Button';
import useBlogPosts from '../hooks/useBlogPosts';
import PostViewModal from '../components/blog/PostViewModal.js'
export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const { posts, activeCategory, setActiveCategory, handleLike, addPost } = useBlogPosts();

  const handleSubmit = (postData) => {
    addPost(postData);
    setShowModal(false);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Header />
      <main className="max-w-7xl mx-auto px-4 pb-20">

        <div className="flex flex-col lg:flex-row gap-6 mb-6 items-center justify-between mt-3">
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full lg:max-w-sm px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <Button
            onClick={() => setShowModal(true)}
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
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Blog Posts */}
        <BlogGrid posts={filteredPosts} onLike={handleLike} onPostClick={setSelectedPost} />
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

