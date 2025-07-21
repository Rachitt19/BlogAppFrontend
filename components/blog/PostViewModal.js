'use client';

import React from 'react';

export default function PostViewModal({ post, onClose }) {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="relative z-10 w-full max-w-3xl mx-4 sm:mx-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl p-6 text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Post content */}
        <h2 className="text-3xl font-bold mb-4 leading-tight">{post.title}</h2>
        <div className="text-white/90 leading-relaxed whitespace-pre-line overflow-y-auto max-h-[65vh] pr-1">
          {post.content}
        </div>
      </div>
    </div>
  );
}
