'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { CATEGORIES } from '../../data/constants';
import { postsAPI } from '../../lib/api';

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'technology',
    content: '',
    tags: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    
    if (formData.title.length > 200) newErrors.title = 'Title must be less than 200 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) {
        setErrors({ submit: 'You must be logged in to create a post' });
        setLoading(false);
        return;
      }

      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await postsAPI.createPost(
        formData.title,
        formData.content,
        formData.category,
        tags
      );

      if (response.success) {
        onSubmit(response.post);
        // Notify other pages to refresh their posts lists (profile/feed)
        if (typeof window !== 'undefined') {
          try {
            let authorId = '';
            if (response.post) {
              // response.post.author might be a populated object or an id string
              authorId = response.post.author?._id || response.post.author || '';
            }

            // If created by current user, proactively refresh their posts list
            const currentUserId = localStorage.getItem('userId');
            if (authorId && currentUserId && authorId === currentUserId) {
              // best-effort refresh via API
              try {
                const refreshed = await postsAPI.getUserPosts(currentUserId, 1, 5);
                window.dispatchEvent(new CustomEvent('postsUpdated', { detail: { post: response.post, action: 'created', authorId, refreshed } }));
              } catch (err) {
                // still dispatch event even if refresh failed
                window.dispatchEvent(new CustomEvent('postsUpdated', { detail: { post: response.post, action: 'created', authorId } }));
              }
            } else {
              window.dispatchEvent(new CustomEvent('postsUpdated', { detail: { post: response.post, action: 'created', authorId } }));
            }
          } catch (e) {
            // fallback for older browsers - still dispatch generic event
            try { window.dispatchEvent(new Event('postsUpdated')); } catch (err) { /* ignore */ }
          }
        }
        setFormData({ title: '', category: 'technology', content: '', tags: '' });
        setErrors({});
        onClose();
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to create post' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Share Your Story">
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Story Title
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
              errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
            }`}
            placeholder="Enter your story title..."
            maxLength={200}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          >
            {CATEGORIES.slice(1).map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            placeholder="e.g. technology, javascript, web development"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
            Full Story
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none ${
              errors.content ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
            }`}
            rows="10"
            placeholder="Share your complete story here..."
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button variant="outline" onClick={handleClose} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={handleSubmit} className="flex-1" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Story'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePostModal;
