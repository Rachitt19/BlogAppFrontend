'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, UserPlus, LogOut, Edit2, Check, User } from 'lucide-react';
import { authAPI, chatAPI } from '../../lib/api';

const GroupInfoModal = ({ chat, onClose, onUpdate, onLeave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [groupName, setGroupName] = useState(chat.groupName);
    const [groupImage, setGroupImage] = useState(chat.groupImage || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('members'); // 'members' or 'add'
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        console.log('Current User:', user);
        console.log('Chat Admin:', chat.groupAdmin);
    }, [chat.groupAdmin]);

    useEffect(() => {
        setGroupName(chat.groupName);
        setGroupImage(chat.groupImage || '');
    }, [chat]);

    const isAdmin = currentUser && (
        (typeof chat.groupAdmin === 'string' && chat.groupAdmin === currentUser._id) ||
        (typeof chat.groupAdmin === 'object' && chat.groupAdmin._id === currentUser._id)
    );

    useEffect(() => {
        const searchUsers = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setSearching(true);
            try {
                const res = await authAPI.searchUsers(searchQuery);
                // Filter out existing members
                const existingIds = chat.participants.map(p => p._id);
                const filteredUsers = res.users.filter(u => !existingIds.includes(u._id));
                setSearchResults(filteredUsers);
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setSearching(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, chat.participants]);

    const handleUpdateGroup = async () => {
        if ((!groupName.trim() || groupName === chat.groupName) && groupImage === chat.groupImage) {
            setIsEditing(false);
            return;
        }

        try {
            const res = await chatAPI.updateGroup(chat._id, { groupName, groupImage });
            onUpdate(res.chat);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating group:', error);
        }
    };

    const handleAddMember = async (userId) => {
        try {
            const res = await chatAPI.addGroupMember(chat._id, userId);
            onUpdate(res.chat);
            setSearchQuery('');
            setActiveTab('members');
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (confirm('Are you sure you want to remove this member?')) {
            try {
                const res = await chatAPI.removeGroupMember(chat._id, userId);
                onUpdate(res.chat);
            } catch (error) {
                console.error('Error removing member:', error);
            }
        }
    };

    const handleLeaveGroup = async () => {
        if (confirm('Are you sure you want to leave this group?')) {
            try {
                await chatAPI.leaveGroup(chat._id);
                onLeave();
                onClose();
            } catch (error) {
                console.error('Error leaving group:', error);
            }
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await chatAPI.uploadImage(file);
            setGroupImage(res.url);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <h2 className="text-lg font-bold">Group Info</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Group Icon & Name Section */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        {isEditing ? (
                            <div className="mb-4 w-full flex flex-col items-center">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-24 h-24 rounded-full overflow-hidden shadow-lg mb-2 bg-gray-100 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative group"
                                >
                                    {groupImage ? (
                                        <img src={groupImage} alt="Group" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-gray-400 flex flex-col items-center">
                                            <span className="text-xs">Upload</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Edit2 className="text-white" size={20} />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                {uploading && <p className="text-xs text-purple-600">Uploading...</p>}
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg mb-2 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                {chat.groupImage ? (
                                    <img src={chat.groupImage} alt={chat.groupName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold text-3xl">{chat.groupName.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-2 mb-2 w-full">
                            {isEditing ? (
                                <div className="flex items-center gap-2 w-full">
                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold text-center"
                                        autoFocus
                                    />
                                    <button onClick={handleUpdateGroup} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                                        <Check size={16} />
                                    </button>
                                    <button onClick={() => { setIsEditing(false); setGroupName(chat.groupName); setGroupImage(chat.groupImage || ''); }} className="p-2 bg-gray-400 text-white rounded-full hover:bg-gray-500">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-gray-800">{chat.groupName}</h3>
                                    {isAdmin && (
                                        <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-purple-600">
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 text-center">{chat.participants.length} members</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-4">
                        <button
                            className={`flex-1 py-2 text-sm font-medium ${activeTab === 'members' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('members')}
                        >
                            Members
                        </button>
                        <button
                            className={`flex-1 py-2 text-sm font-medium ${activeTab === 'add' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('add')}
                        >
                            Add Members
                        </button>
                    </div>

                    {/* Members List */}
                    {activeTab === 'members' && (
                        <div className="space-y-2">
                            {/* Deduplicate participants based on _id */}
                            {Array.from(new Map(chat.participants.map(user => [user._id, user])).values()).map(user => (
                                <div key={user._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            user.displayName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{user.displayName}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    {(chat.groupAdmin === user._id || chat.groupAdmin?._id === user._id) && (
                                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">Admin</span>
                                    )}
                                    {isAdmin && (chat.groupAdmin !== user._id && chat.groupAdmin?._id !== user._id) && (
                                        <button
                                            onClick={() => handleRemoveMember(user._id)}
                                            className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove member"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Members */}
                    {activeTab === 'add' && (
                        <div>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search users to add..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                {searching ? (
                                    <div className="text-center text-gray-500 py-4">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(user => (
                                        <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                                                    {user.displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{user.displayName}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddMember(user._id)}
                                                className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors"
                                            >
                                                <UserPlus size={18} />
                                            </button>
                                        </div>
                                    ))
                                ) : searchQuery ? (
                                    <div className="text-center text-gray-500 py-4">No users found</div>
                                ) : (
                                    <div className="text-center text-gray-500 py-4">Type to search users</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handleLeaveGroup}
                        className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={20} />
                        Leave Group
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupInfoModal;
