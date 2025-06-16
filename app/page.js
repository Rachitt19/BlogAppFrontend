'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import CategoryFilter from '../components/blog/CategoryFilter';
import BlogGrid from '../components/blog/BlogGrid';
import CreatePostModal from '../components/blog/CreatePostModal';
import Button from '../components/ui/Button';
import useBlogPosts from '../hooks/useBlogPosts';

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const { posts, activeCategory, setActiveCategory, handleLike, addPost } = useBlogPosts();

  const handleSubmit = (postData) => {
    addPost(postData);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 pb-20">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center justify-between">
          <CategoryFilter 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
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

        {/* Blog Posts */}
        <BlogGrid posts={posts} onLike={handleLike} />

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

