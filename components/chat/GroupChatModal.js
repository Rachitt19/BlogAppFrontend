import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check } from 'lucide-react';
import { authAPI, chatAPI } from '../../lib/api';

const GroupChatModal = ({ onClose, onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const searchUsers = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setSearching(true);
            try {
                const res = await authAPI.searchUsers(searchQuery);
                setSearchResults(res.users);
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setSearching(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleUserSelect = (user) => {
        if (selectedUsers.find(u => u._id === user._id)) {
            setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim() || selectedUsers.length < 2) return;

        setLoading(true);
        try {
            const userIds = selectedUsers.map(u => u._id);
            const res = await chatAPI.createGroupChat(groupName, userIds);
            onGroupCreated(res.chat);
            onClose();
        } catch (error) {
            console.error('Error creating group chat:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <h2 className="text-lg font-bold">Create Group Chat</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Enter group name"
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Add Members</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedUsers.map(user => (
                                <div key={user._id} className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm">
                                    <span>{user.displayName}</span>
                                    <button onClick={() => handleUserSelect(user)} className="hover:text-purple-900">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Search Results */}
                    <div className="h-48 overflow-y-auto border border-gray-100 rounded-xl mb-4">
                        {searching ? (
                            <div className="p-4 text-center text-gray-500">Searching...</div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map(user => {
                                const isSelected = selectedUsers.find(u => u._id === user._id);
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => handleUserSelect(user)}
                                        className={`p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-purple-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {user.displayName[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{user.displayName}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        {isSelected && <Check size={18} className="text-purple-600" />}
                                    </div>
                                );
                            })
                        ) : searchQuery ? (
                            <div className="p-4 text-center text-gray-500">No users found</div>
                        ) : (
                            <div className="p-4 text-center text-gray-500">Type to search users</div>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!groupName.trim() || selectedUsers.length < 1 || loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creating...' : (
                            <>
                                <UserPlus size={20} />
                                Create Group
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupChatModal;
