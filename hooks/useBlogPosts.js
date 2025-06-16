'use client';

import { useState, useEffect } from 'react';
import { SAMPLE_POSTS } from '../data/samplePosts';

const useBlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  // Initialize with sample posts
  useEffect(() => {
    setPosts(SAMPLE_POSTS);
    setFilteredPosts(SAMPLE_POSTS);
  }, []);

  // Filter posts by category
  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.category === activeCategory));
    }
  }, [activeCategory, posts]);

  const handleLike = (postId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked 
            }
          : post
      )
    );
  };

  const addPost = (postData) => {
    const newPost = {
      id: Date.now(),
      ...postData,
      likes: 0,
      date: new Date().toISOString().split('T')[0],
      liked: false
    };
    
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return {
    posts: filteredPosts,
    activeCategory,
    setActiveCategory,
    handleLike,
    addPost
  };
};

export default useBlogPosts;
