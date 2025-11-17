(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/lib/api.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "authAPI": (()=>authAPI),
    "communitiesAPI": (()=>communitiesAPI),
    "postsAPI": (()=>postsAPI)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const API_URL = ("TURBOPACK compile-time value", "http://localhost:7777/api") || 'http://localhost:7777/api';
// Create axios instance with CORS-friendly configuration
const apiClient = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: API_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // Helps with CORS
    }
});
// Request interceptor - add authorization token
apiClient.interceptors.request.use((config)=>{
    // Add token to Authorization header if it exists
    if ("TURBOPACK compile-time truthy", 1) {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error)=>{
    return Promise.reject(error);
});
// Response interceptor - handle errors
apiClient.interceptors.response.use((response)=>response, (error)=>{
    // Handle 401 unauthorized - clear token and logout
    if (error.response?.status === 401) {
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
        // Optionally redirect to login
        if ("object" !== 'undefined' && window.location.pathname !== '/') {
        // window.location.href = '/';
        }
    }
    // Log error details for debugging
    console.error('API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
    });
    return Promise.reject(error);
});
const authAPI = {
    signup: async (email, password, displayName)=>{
        try {
            const response = await apiClient.post('/auth/signup', {
                email,
                password,
                displayName
            });
            // Store token if provided
            if (response.data.token && "object" !== 'undefined') {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user || {
                    email,
                    displayName
                }));
                localStorage.setItem('userId', response.data.id);
            }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Signup failed';
            console.error('Signup error:', message);
            throw new Error(message);
        }
    },
    signin: async (email, password)=>{
        try {
            const response = await apiClient.post('/auth/signin', {
                email,
                password
            });
            // Store token if provided
            if (response.data.token && "object" !== 'undefined') {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user || {
                    email
                }));
                localStorage.setItem('userId', response.data.id);
            }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Signin failed';
            console.error('Signin error:', message);
            throw new Error(message);
        }
    },
    getCurrentUser: async (token)=>{
        try {
            const response = await apiClient.get('/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch user';
            console.error('Get user error:', message);
            throw new Error(message);
        }
    },
    updateProfile: async (displayName, photoURL)=>{
        try {
            const response = await apiClient.put('/auth/profile', {
                displayName,
                photoURL
            });
            // Update stored user info
            if ("TURBOPACK compile-time truthy", 1) {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.displayName = displayName;
                user.photoURL = photoURL;
                localStorage.setItem('user', JSON.stringify(user));
            }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update profile';
            console.error('Update profile error:', message);
            throw new Error(message);
        }
    },
    logout: ()=>{
        // Clear local storage
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userId');
        }
    }
};
const postsAPI = {
    // Get all posts with pagination, search, filter, sort
    getAllPosts: async (page = 1, limit = 10, category = null, search = null, sort = '-createdAt')=>{
        try {
            let url = `/blogs?page=${page}&limit=${limit}&sort=${sort}`;
            if (category && category !== 'all' && category !== 'All') {
                url += `&category=${category}`;
            }
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch posts';
            console.error('Get posts error:', message);
            throw new Error(message);
        }
    },
    // Get single post
    getPost: async (postId)=>{
        try {
            const response = await apiClient.get(`/blogs/${postId}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch post';
            console.error('Get post error:', message);
            throw new Error(message);
        }
    },
    // Create post
    createPost: async (title, content, category, tags = [], image = null)=>{
        try {
            const response = await apiClient.post('/blogs', {
                title,
                content,
                category,
                tags,
                image
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create post';
            console.error('Create post error:', message);
            throw new Error(message);
        }
    },
    // Update post
    updatePost: async (postId, title, content, category, tags = [], image = null)=>{
        try {
            const response = await apiClient.put(`/blogs/${postId}`, {
                title,
                content,
                category,
                tags,
                image
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update post';
            console.error('Update post error:', message);
            throw new Error(message);
        }
    },
    // Delete post
    deletePost: async (postId)=>{
        try {
            const response = await apiClient.delete(`/blogs/${postId}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete post';
            console.error('Delete post error:', message);
            throw new Error(message);
        }
    },
    // Like post
    likePost: async (postId)=>{
        try {
            const response = await apiClient.post(`/blogs/${postId}/like`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to like post';
            console.error('Like post error:', message);
            throw new Error(message);
        }
    },
    // Add comment
    addComment: async (postId, content)=>{
        try {
            const response = await apiClient.post(`/blogs/${postId}/comments`, {
                content
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to add comment';
            console.error('Add comment error:', message);
            throw new Error(message);
        }
    },
    // Delete comment
    deleteComment: async (postId, commentId)=>{
        try {
            const response = await apiClient.delete(`/blogs/${postId}/comments/${commentId}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete comment';
            console.error('Delete comment error:', message);
            throw new Error(message);
        }
    },
    // Get user's posts
    getUserPosts: async (userId, page = 1, limit = 10)=>{
        try {
            const response = await apiClient.get(`/blogs/users/${userId}/posts?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch user posts';
            console.error('Get user posts error:', message);
            throw new Error(message);
        }
    },
    // Get user's liked posts
    getLikedPosts: async (userId, page = 1, limit = 10)=>{
        try {
            const response = await apiClient.get(`/blogs/users/${userId}/liked-posts?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch liked posts';
            console.error('Get liked posts error:', message);
            throw new Error(message);
        }
    }
};
const communitiesAPI = {
    // Get all communities
    getAllCommunities: async (page = 1, limit = 10, search = null)=>{
        try {
            let url = `/communities?page=${page}&limit=${limit}`;
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch communities';
            console.error('Get communities error:', message);
            throw new Error(message);
        }
    },
    // Get popular communities
    getPopularCommunities: async (limit = 6)=>{
        try {
            const response = await apiClient.get(`/communities/popular?limit=${limit}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch popular communities';
            console.error('Get popular communities error:', message);
            throw new Error(message);
        }
    },
    // Get single community
    getCommunity: async (communityId)=>{
        try {
            const response = await apiClient.get(`/communities/${communityId}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch community';
            console.error('Get community error:', message);
            throw new Error(message);
        }
    },
    // Create community
    createCommunity: async (name, description, icon = '🚀', category = 'general', rules = [])=>{
        try {
            const response = await apiClient.post('/communities', {
                name,
                description,
                icon,
                category,
                rules
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to create community';
            console.error('Create community error:', message);
            throw new Error(message);
        }
    },
    // Join community
    joinCommunity: async (communityId)=>{
        try {
            const response = await apiClient.post(`/communities/${communityId}/join`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to join community';
            console.error('Join community error:', message);
            throw new Error(message);
        }
    },
    // Leave community
    leaveCommunity: async (communityId)=>{
        try {
            const response = await apiClient.post(`/communities/${communityId}/leave`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to leave community';
            console.error('Leave community error:', message);
            throw new Error(message);
        }
    },
    // Get user's joined communities
    getUserCommunities: async (userId, page = 1, limit = 10)=>{
        try {
            const response = await apiClient.get(`/communities/user/${userId}?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch user communities';
            console.error('Get user communities error:', message);
            throw new Error(message);
        }
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/hooks/useAuth.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "AuthProvider": (()=>AuthProvider),
    "useAuth": (()=>useAuth)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])();
const useAuth = ()=>{
    _s();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
_s(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
const AuthProvider = ({ children })=>{
    _s1();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [token, setToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Load user from localStorage on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const storedToken = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('user');
            if (storedToken && storedUser) {
                try {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        }
    }["AuthProvider.useEffect"], []);
    // Email/Password Sign Up
    const signUp = async (email, password, displayName)=>{
        try {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authAPI"].signup(email, password, displayName);
            if (result.success) {
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                setToken(result.token);
                setUser(result.user);
                return {
                    success: true,
                    user: result.user
                };
            }
            return {
                success: false,
                error: result.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    };
    // Email/Password Sign In
    const signIn = async (email, password)=>{
        try {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authAPI"].signin(email, password);
            if (result.success) {
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                setToken(result.token);
                setUser(result.user);
                return {
                    success: true,
                    user: result.user
                };
            }
            return {
                success: false,
                error: result.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    };
    // Sign Out
    const logout = async ()=>{
        try {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    };
    const value = {
        user,
        loading,
        token,
        signUp,
        signIn,
        logout
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/hooks/useAuth.js",
        lineNumber: 100,
        columnNumber: 5
    }, this);
};
_s1(AuthProvider, "s3+shCSR/t4KywrfJXNOwwFNgWM=");
_c = AuthProvider;
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_ba60687f._.js.map