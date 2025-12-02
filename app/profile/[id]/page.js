'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/layout/Header';
import Button from '../../../components/ui/Button';
import UserListModal from '../../../components/profile/UserListModal';
import { postsAPI, authAPI, followAPI, chatAPI } from '../../../lib/api';
import { Eye, MessageCircle, Heart, UserPlus, UserMinus, Users } from 'lucide-react';
import Link from 'next/link';

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [currentUser, setCurrentUser] = useState(null);
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [activeTab, setActiveTab] = useState('posts');
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    // User List Modal State
    const [showUserListModal, setShowUserListModal] = useState(false);
    const [userListTitle, setUserListTitle] = useState('');
    const [userListUsers, setUserListUsers] = useState([]);
    const [userListLoading, setUserListLoading] = useState(false);

    const handleShowFollowers = async () => {
        setUserListTitle('Followers');
        setShowUserListModal(true);
        setUserListLoading(true);
        try {
            const res = await followAPI.getFollowers(id);
            setUserListUsers(res.followers);
        } catch (error) {
            console.error('Error fetching followers:', error);
        } finally {
            setUserListLoading(false);
        }
    };

    const handleShowFollowing = async () => {
        setUserListTitle('Following');
        setShowUserListModal(true);
        setUserListLoading(true);
        try {
            const res = await followAPI.getFollowing(id);
            setUserListUsers(res.following);
        } catch (error) {
            console.error('Error fetching following:', error);
        } finally {
            setUserListLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const storedUserId = localStorage.getItem('userId');

                if (storedUserId) {
                    setCurrentUser({ id: storedUserId });
                    // Redirect to my profile if viewing own profile
                    if (storedUserId === id) {
                        router.push('/profile');
                        return;
                    }
                }

                // Fetch profile user data
                const userRes = await authAPI.getUser(id);
                setProfileUser(userRes.user);

                // Fetch follow status and counts
                const [followersRes, followingRes] = await Promise.all([
                    followAPI.getFollowers(id),
                    followAPI.getFollowing(id)
                ]);

                setFollowersCount(followersRes.count);
                setFollowingCount(followingRes.count);

                if (token && storedUserId) {
                    const statusRes = await followAPI.checkFollowStatus(id);
                    setIsFollowing(statusRes.isFollowing);
                }

                // Fetch posts
                const postsData = await postsAPI.getUserPosts(id, 1, 5);
                setPosts(postsData.posts || []);
                setPagination(postsData.pagination || {});

            } catch (error) {
                console.error('Error loading profile:', error);
                // router.push('/'); // Optional: redirect on error
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            init();
        }
    }, [id, router]);

    const handleFollow = async () => {
        try {
            if (!currentUser) {
                alert('Please login to follow users');
                return;
            }

            if (isFollowing) {
                await followAPI.unfollowUser(id);
                setFollowersCount(prev => Math.max(0, prev - 1));
                setIsFollowing(false);
            } else {
                await followAPI.followUser(id);
                setFollowersCount(prev => prev + 1);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            alert('Failed to update follow status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-20">
                    <div className="text-center text-white">Loading...</div>
                </main>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-20">
                    <div className="text-center text-white">User not found</div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-20 pb-40">
                {/* Profile Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                {profileUser.displayName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{profileUser.displayName}</h1>
                            <p className="text-gray-600 mb-4">Joined {new Date(profileUser.createdAt).toLocaleDateString()}</p>

                            <div className="flex items-center justify-center md:justify-start gap-6 mb-4">
                                <button
                                    onClick={handleShowFollowers}
                                    className="text-center hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                                >
                                    <div className="font-bold text-gray-800">{followersCount}</div>
                                    <div className="text-sm text-gray-500">Followers</div>
                                </button>
                                <button
                                    onClick={handleShowFollowing}
                                    className="text-center hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                                >
                                    <div className="font-bold text-gray-800">{followingCount}</div>
                                    <div className="text-sm text-gray-500">Following</div>
                                </button>
                                <div className="text-center p-2">
                                    <div className="font-bold text-gray-800">{pagination.total || 0}</div>
                                    <div className="text-sm text-gray-500">Posts</div>
                                </div>
                            </div>

                            {currentUser && currentUser.id !== id && (
                                <div className="flex gap-3 mt-6 mx-auto md:mx-0">
                                    <Button
                                        onClick={handleFollow}
                                        variant={isFollowing ? "outline" : "gradient"}
                                        className="flex items-center gap-2"
                                    >
                                        {isFollowing ? (
                                            <>
                                                <UserMinus size={18} />
                                                Unfollow
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={18} />
                                                Follow
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            try {
                                                const res = await chatAPI.createChat(id);
                                                router.push('/chat');
                                            } catch (error) {
                                                console.error('Error creating chat:', error);
                                            }
                                        }}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <MessageCircle size={18} />
                                        Message
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Published Stories</h2>

                    {posts.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <p className="text-gray-600 text-lg">No stories published yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <div
                                    key={post._id}
                                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                        <div className="flex-1">
                                            <Link href={`/blog/${post._id}`}>
                                                <h3 className="text-xl font-bold text-gray-800 hover:text-purple-600 cursor-pointer transition-colors mb-2">
                                                    {post.title}
                                                </h3>
                                            </Link>
                                            <p className="text-gray-600 line-clamp-2 mb-3">
                                                {post.content.substring(0, 150)}...
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                                                    {post.category}
                                                </span>
                                                <span>
                                                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 border-t border-gray-200 pt-4">
                                        <div className="flex items-center gap-1">
                                            <Eye size={16} />
                                            <span>{post.views || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Heart size={16} />
                                            <span>{post.likes?.length || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageCircle size={16} />
                                            <span>{post.comments?.length || 0}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link href={`/blog/${post._id}`} className="flex-1">
                                            <Button variant="outline" className="w-full">
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <UserListModal
                isOpen={showUserListModal}
                onClose={() => setShowUserListModal(false)}
                title={userListTitle}
                users={userListUsers}
                loading={userListLoading}
            />
        </div>
    );
}
