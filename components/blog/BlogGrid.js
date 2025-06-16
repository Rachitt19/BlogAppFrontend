'use client';

import React from 'react';
import BlogCard from './BlogCard';

const BlogGrid = ({ posts, onLike }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4" role="img" aria-label="Books">📚</div>
        <p className="text-white/60 text-xl">No stories found in this category yet.</p>
        <p className="text-white/40">Be the first to share your story!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map(post => (
        <BlogCard 
          key={post.id} 
          post={post} 
          onLike={onLike} 
        />
      ))}
    </div>
  );
};

export default BlogGrid;
