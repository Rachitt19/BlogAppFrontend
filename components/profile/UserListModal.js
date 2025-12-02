'use client';

import React from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

const UserListModal = ({ isOpen, onClose, title, users, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* List */}
                <div className="max-h-[60vh] overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No users found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => {
                                if (!user) return null;
                                return (
                                    <Link
                                        key={user._id || user.id}
                                        href={`/profile/${user._id || user.id}`}
                                        onClick={onClose}
                                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {user.displayName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {user.displayName}
                                            </p>
                                            {user.email && (
                                                <p className="text-sm text-gray-500 truncate">
                                                    {user.email}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListModal;
