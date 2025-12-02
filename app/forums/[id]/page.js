'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/layout/Header';
import { forumAPI } from '../../../lib/api';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';

export default function ThreadPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [thread, setThread] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadThread();
    }, [id]);

    const loadThread = async () => {
        try {
            const data = await forumAPI.getThread(id);
            setThread(data.thread);
            setComments(data.comments);
        } catch (error) {
            console.error('Failed to load thread:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Please login to comment');
                return;
            }

            await forumAPI.addComment(id, newComment);
            setNewComment('');
            loadThread(); // Reload to show new comment
        } catch (error) {
            console.error('Failed to add comment:', error);
            alert('Failed to add comment');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-20">
                    <div className="text-center text-white">Loading discussion...</div>
                </main>
            </div>
        );
    }

    if (!thread) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-20">
                    <div className="text-center text-white">Thread not found</div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-12 pb-20">
                <Link
                    href={`/communities/${thread.community}`}
                    className="inline-flex items-center gap-2 text-white hover:text-pink-200 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Community
                </Link>

                {/* Thread Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{thread.title}</h1>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                {thread.author?.displayName?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-700">{thread.author?.displayName}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{thread.views} views</span>
                    </div>

                    <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {thread.content}
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <MessageCircle size={24} />
                        Comments ({comments.length})
                    </h3>

                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} className="mb-8 flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add to the discussion..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Send size={18} />
                            Post
                        </button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment._id} className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                                        {comment.author?.displayName?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="font-bold text-gray-800">{comment.author?.displayName}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-700">{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
