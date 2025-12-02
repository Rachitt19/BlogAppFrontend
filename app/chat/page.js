'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import { chatAPI, authAPI } from '../../lib/api';
import GroupChatModal from '../../components/chat/GroupChatModal';
import GroupInfoModal from '../../components/chat/GroupInfoModal';
import { Send, Search, MessageCircle, Plus, Users } from 'lucide-react';
import io from 'socket.io-client';

export default function ChatPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const messagesEndRef = useRef(null);

    // Initialize user and socket
    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                router.push('/');
                return;
            }

            try {
                const userRes = await authAPI.getCurrentUser(token);
                const user = userRes.user;
                const userId = user._id || user.id || user.userId;
                setCurrentUser({ ...user, id: userId });

                // Connect socket
                const newSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8888');
                setSocket(newSocket);

                newSocket.on('connect', () => {
                    console.log('Connected to socket');
                    newSocket.emit('join', userId);
                });

                newSocket.on('receive_message', (message) => {
                    setMessages(prev => [...prev, message]);
                    scrollToBottom();
                });

                newSocket.on('chat_updated', (data) => {
                    // Refresh chats list to show new last message
                    loadChats();
                });

                newSocket.on('new_group_chat', (chat) => {
                    loadChats();
                });

                return () => newSocket.disconnect();
            } catch (error) {
                console.error('Error initializing chat:', error);
            }
        };

        init();
    }, [router]);

    // Load chats
    const loadChats = async () => {
        try {
            const res = await chatAPI.getChats();
            setChats(res.chats);
            setLoading(false);
        } catch (error) {
            console.error('Error loading chats:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChats();
    }, []);

    // Load messages when active chat changes
    useEffect(() => {
        if (!activeChat) return;

        const loadMessages = async () => {
            try {
                const res = await chatAPI.getMessages(activeChat._id);
                setMessages(res.messages);
                scrollToBottom();

                // Mark messages as read
                await chatAPI.markRead(activeChat._id);
                // Notify header to update unread count
                window.dispatchEvent(new Event('messagesRead'));

                if (socket) {
                    socket.emit('join_chat', activeChat._id);
                }
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        };

        loadMessages();
    }, [activeChat, socket]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat || !currentUser) return;

        try {
            socket.emit('send_message', {
                chatId: activeChat._id,
                senderId: currentUser.id,
                content: newMessage
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const getChatName = (chat) => {
        if (chat.isGroup) return chat.groupName;
        const otherUser = chat.participants.find(p => p._id !== currentUser?.id) || chat.participants[0];
        return otherUser?.displayName || 'Unknown User';
    };

    const getChatImage = (chat) => {
        if (chat.isGroup) return null; // Use default group icon
        const otherUser = chat.participants.find(p => p._id !== currentUser?.id) || chat.participants[0];
        return otherUser?.displayName?.charAt(0).toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
                <Header />
                <main className="max-w-6xl mx-auto px-4 py-20">
                    <div className="text-center text-white">Loading chats...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
            <Header />
            <main className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-80px)]">
                <div className="bg-white rounded-2xl shadow-2xl h-full flex overflow-hidden">
                    {/* Sidebar - Chat List */}
                    <div className="w-1/3 border-r border-gray-200 flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                                <button
                                    onClick={() => setShowGroupModal(true)}
                                    className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                                    title="Create Group"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search chats..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {chats.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No chats yet</p>
                                </div>
                            ) : (
                                chats.map(chat => {
                                    const chatName = getChatName(chat);
                                    const chatImage = getChatImage(chat);

                                    return (
                                        <div
                                            key={chat._id}
                                            onClick={() => setActiveChat(chat)}
                                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 ${activeChat?._id === chat._id ? 'bg-purple-50' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${chat.isGroup ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'} overflow-hidden`}>
                                                    {chat.isGroup ? (
                                                        chat.groupImage ? (
                                                            <img src={chat.groupImage} alt={chat.groupName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Users size={24} />
                                                        )
                                                    ) : (
                                                        chatImage
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h3 className="font-semibold text-gray-800 truncate">
                                                            {chatName}
                                                        </h3>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(chat.updatedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {chat.isGroup && chat.lastMessage ? `${chat.lastMessage.sender?.displayName || 'User'}: ` : ''}
                                                        {chat.lastMessage?.content || 'Start a conversation'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-gray-50">
                        {activeChat ? (
                            <>
                                {/* Chat Header */}
                                <div
                                    className={`p-4 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm ${activeChat.isGroup ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                    onClick={() => activeChat.isGroup && setShowGroupInfo(true)}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${activeChat.isGroup ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'} overflow-hidden`}>
                                        {activeChat.isGroup ? (
                                            activeChat.groupImage ? (
                                                <img src={activeChat.groupImage} alt={activeChat.groupName} className="w-full h-full object-cover" />
                                            ) : (
                                                <Users size={20} />
                                            )
                                        ) : (
                                            getChatImage(activeChat)
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">
                                            {getChatName(activeChat)}
                                        </h3>
                                        {activeChat.isGroup ? (
                                            <p className="text-xs text-gray-500">
                                                {new Set(activeChat.participants.map(p => p._id)).size} members
                                            </p>
                                        ) : (
                                            <p className="text-xs text-green-500 flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                Online
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map((msg, index) => {
                                        const isMe = msg.sender._id === currentUser.id || msg.sender === currentUser.id;
                                        return (
                                            <div
                                                key={index}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                {!isMe && activeChat.isGroup && (
                                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 mr-2 self-end mb-1">
                                                        {msg.sender.displayName?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="max-w-[70%]">
                                                    {!isMe && activeChat.isGroup && (
                                                        <p className="text-xs text-gray-500 ml-1 mb-1">{msg.sender.displayName}</p>
                                                    )}
                                                    <div
                                                        className={`rounded-2xl px-4 py-2 ${isMe
                                                            ? 'bg-purple-600 text-white rounded-br-none'
                                                            : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                                                            }`}
                                                    >
                                                        <p>{msg.content}</p>
                                                        <p className={`text-xs mt-1 ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-gray-200">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <MessageCircle size={64} className="mb-4 opacity-20" />
                                <p className="text-lg">Select a chat to start messaging</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showGroupModal && (
                <GroupChatModal
                    onClose={() => setShowGroupModal(false)}
                    onGroupCreated={(newChat) => {
                        setChats(prev => [newChat, ...prev]);
                        setActiveChat(newChat);
                    }}
                />
            )}

            {showGroupInfo && activeChat && (
                <GroupInfoModal
                    chat={activeChat}
                    onClose={() => setShowGroupInfo(false)}
                    onUpdate={(updatedChat) => {
                        setActiveChat(updatedChat);
                        setChats(prev => prev.map(c => c._id === updatedChat._id ? updatedChat : c));
                    }}
                    onLeave={() => {
                        setActiveChat(null);
                        setChats(prev => prev.filter(c => c._id !== activeChat._id));
                    }}
                />
            )}
        </div>
    );
}
