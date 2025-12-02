'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/layout/Header';
import Button from '../../../components/ui/Button';
import { postsAPI } from '../../../lib/api';
import { Heart, MessageCircle, Share2, Eye, Clock, User, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }

        const postData = await postsAPI.getPost(postId);
        if (postData.success) {
          setPost(postData.post);
          const userId = localStorage.getItem('userId');
          setLiked(postData.post.likes?.includes(userId));
        }
      } catch (error) {
        console.error('Failed to load post:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Please login to like posts');
        return;
      }

      const userId = localStorage.getItem('userId');
      const response = await postsAPI.likePost(postId);
      if (response.success) {
        setPost(response.post);
        // Check if user's ID is in the likes array
        setLiked(response.post.likes?.includes(userId) || false);

        // Notify other pages that a post was liked/unliked
        if (typeof window !== 'undefined') {
          try {
            window.dispatchEvent(new CustomEvent('postsUpdated', { detail: { post: response.post, action: 'liked' } }));
          } catch (e) {
            window.dispatchEvent(new Event('postsUpdated'));
          }
        }
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Please login to comment');
        return;
      }

      setPosting(true);
      const response = await postsAPI.addComment(postId, commentText);
      if (response.success) {
        setPost(response.post);
        setCommentText('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const response = await postsAPI.deleteComment(postId, commentId);
      if (response.success) {
        setPost(response.post);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postsAPI.deletePost(postId);
      router.push('/profile');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center text-white">Loading post...</div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Link href="/">
              <Button variant="gradient">Back to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isAuthor = currentUser && post.author._id === localStorage.getItem('userId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 pb-40">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-pink-200 mb-6 transition-colors">
          <ArrowLeft size={20} />
          Back to Stories
        </Link>

        {/* Article Container */}
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-12">
            <div className="flex items-center justify-between mb-6">
              <span className="inline-block bg-white bg-opacity-20 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {post.category}
              </span>
              {isAuthor && (
                <div className="flex gap-2">
                  <Link href={`/blog/${post._id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit2 size={16} />
                    </Button>
                  </Link>
                  <button
                    onClick={handleDeletePost}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 text-white text-sm">
              <Link href={`/user/${post.author._id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center font-bold">
                  {post.author.displayName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{post.author.displayName}</div>
                  <div className="text-white text-opacity-80">{post.author.email}</div>
                </div>
              </Link>
              <div className="flex items-center gap-2 text-white text-opacity-80">
                <Clock size={16} />
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-12">
            {/* Stats */}
            <div className="flex items-center gap-8 mb-12 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <Eye size={18} />
                <span>{post.views || 0} views</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Heart size={18} />
                <span>{post.likes?.length || 0} likes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle size={18} />
                <span>{post.comments?.length || 0} comments</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-200">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mb-12 pb-8 border-b border-gray-200">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  liked
                    ? 'bg-red-100 text-red-700 border-2 border-red-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
                }`}
              >
                {liked ? (
                  <Heart size={20} fill="currentColor" color="#dc2626" />
                ) : (
                  <Heart size={20} />
                )}
                {liked ? 'Liked' : 'Like'}
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                <Share2 size={20} />
                Share
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">Comments ({post.comments?.length || 0})</h2>

              {/* Add Comment */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                {currentUser ? (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                        rows="3"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="gradient"
                        onClick={handleAddComment}
                        disabled={!commentText.trim() || posting}
                      >
                        {posting ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">Login to leave a comment</p>
                    <Link href="/">
                      <Button variant="gradient">Login</Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment._id} className="flex gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {comment.authorName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-800">
                            {comment.authorName}
                          </div>
                          {currentUser && comment.author === localStorage.getItem('userId') && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700 mb-1">{comment.content}</p>
                        <div className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Related Stories</h2>
          <p className="text-white text-opacity-75">More great stories coming soon...</p>
        </div>
      </main>
    </div>
  );
}
