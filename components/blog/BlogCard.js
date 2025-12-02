'use client';

import React from 'react';
import { Heart, Calendar, User, MessageCircle, Eye, Share2 } from 'lucide-react';
import { CATEGORIES } from '../../data/constants';
import Link from 'next/link';

const BlogCard = ({ post, onLike, onPostClick }) => {
  const getCategoryColor = (categoryId) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.color : 'from-gray-500 to-gray-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const authorName = post.author?.displayName || post.authorName || 'Anonymous';

  // Get userId from localStorage
  let userId = null;
  if (typeof window !== 'undefined') {
    userId = localStorage.getItem('userId');
  }

  // Calculate like state
  const likes = Array.isArray(post.likes) ? post.likes : [];
  const likeCount = likes.length;
  const isLiked = userId ? likes.includes(userId) : false;

  const commentCount = post.comments?.length || 0;
  const viewCount = post.views || 0;
  const postId = post._id || post.id;

  return (
    <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200">
      {/* Main Content */}
      <div className="p-6">
        {/* Header with Category and Author */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(post.category)}`}>
                {CATEGORIES.find(cat => cat.id === post.category)?.name || post.category}
              </span>
              <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
            </div>

            <Link href={`/blog/${postId}`}>
              <h2 className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors cursor-pointer line-clamp-2 mb-2">
                {post.title}
              </h2>
            </Link>

            {/* Preview */}
            <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
              {post.content?.substring(0, 150) || post.excerpt}...
            </p>
          </div>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3 py-3 border-t border-b border-gray-100">
          <Link href={`/profile/${post.author?._id || post.author}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {authorName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 hover:text-purple-600 transition-colors">{authorName}</p>
              <p className="text-xs text-gray-500">Author</p>
            </div>
          </Link>
        </div>

        {/* Stats Bar - Reddit/Quora Style */}
        <div className="flex items-center gap-4 py-3 text-xs text-gray-600 px-0">
          {/* Views */}
          <div className="flex items-center gap-1 hover:text-purple-600 transition-colors cursor-pointer">
            <Eye size={16} />
            <span>{viewCount}</span>
          </div>

          {/* Likes */}
          <div className="flex items-center gap-1">
            <span>{likeCount}</span>
          </div>

          {/* Comments */}
          <div className="flex items-center gap-1">
            <MessageCircle size={16} />
            <span>{commentCount}</span>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Share Button */}
          <button className="text-gray-500 hover:text-purple-600 transition-colors">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-4 flex gap-2">
        <Link href={`/blog/${postId}`} className="flex-1">
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            View Post
          </button>
        </Link>

        <button
          onClick={() => {
            const token = localStorage.getItem('authToken');
            if (!token) {
              alert('Please login to like posts');
              return;
            }
            onLike(postId);
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${isLiked
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600'
            }`}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
          Like
        </button>
      </div>
    </article>
  );
};

export default BlogCard;
