'use client';

import React from 'react';
import { Heart, Calendar, User, Tag } from 'lucide-react';
import { CATEGORIES } from '../../data/constants';

const BlogCard = ({ post, onLike, onPostClick}) => {
  const getCategoryColor = (categoryId) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.color : 'from-gray-500 to-gray-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <article className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
      <div className="flex items-center justify-between mb-4">
        <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${getCategoryColor(post.category)}`}>
          <Tag size={14} className="inline mr-1" />
          {CATEGORIES.find(cat => cat.id === post.category)?.name}
        </span>
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
            post.liked
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
          aria-label={post.liked ? 'Unlike post' : 'Like post'}
        >
          <Heart size={16} className={post.liked ? 'fill-current' : ''} />
          {post.likes}
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-700 transition-colors cursor-pointer" onClick={() => onPostClick(post)}>
        {post.title}
      </h2>
      
      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
        {post.excerpt}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <User size={14} />
          <span className="font-medium">{post.author}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
