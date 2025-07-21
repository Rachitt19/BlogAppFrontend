'use client';
import React from 'react';

export default function PostViewModal({ post, onClose }) {
  if (!post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        className="relative bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold transition"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="px-8 pt-10 pb-4 border-b border-white/30">
          <h2 className="text-3xl font-bold">{post.title}</h2>
          <div className="mt-2 flex gap-4 text-white/80 text-sm">
            <span>By {post.author}</span>
            <span>•</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString()}
            </time>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 bg-white/10 backdrop-blur-sm rounded-b-2xl">
          <p className="whitespace-pre-line leading-relaxed text-lg text-white">
            {post.content}
          </p>
        </div>
      </div>
    </div>
  );
}