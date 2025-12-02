'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { authAPI, followAPI } from '../../lib/api';
import { Search, UserPlus, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const res = await authAPI.getCurrentUser(token);
                    setCurrentUser(res.user);
                } catch (error) {
                    console.error('Error loading user:', error);
                }
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        const search = async () => {
            if (!query.trim()) {
                setUsers([]);
                return;
            }

            setLoading(true);
            try {
                const res = await authAPI.searchUsers(query);
                setUsers(res.users);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(search, 500);
        return () => clearTimeout(debounce);
    }, [query]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[600px]">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Find People</h1>

                    {/* Search Input */}
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-14 pr-6 py-4 text-lg bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Searching...</div>
                    ) : users.length > 0 ? (
                        <div className="grid gap-4">
                            {users.map((user) => (
                                <Link
                                    href={`/profile/${user._id}`}
                                    key={user._id}
                                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                            {user.displayName?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">{user.displayName}</h3>
                                            <p className="text-sm text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {currentUser && currentUser.id !== user._id && (
                                        <div className="text-purple-600 font-semibold text-sm">
                                            View Profile
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : query ? (
                        <div className="text-center py-12 text-gray-500">No users found</div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <Search size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Type to start searching</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
