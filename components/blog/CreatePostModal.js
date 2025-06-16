'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { CATEGORIES } from '../../utils/constants';

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'technology',
    content: '',
    excerpt: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author name is required';
    if (!formData.content.trim()) newErrors.content = 'Story content is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Story excerpt is required';
    
    if (formData.title.length > 100) newErrors.title = 'Title must be less than 100 characters';
    if (formData.excerpt.length > 200) newErrors.excerpt = 'Excerpt must be less than 200 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    onSubmit(formData);
    setFormData({ title: '', author: '', category: 'technology', content: '', excerpt: '' });
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Story Title *
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
              maxLength={100}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          
          <div>
            <label htmlFor="author" className="block text-sm font-semibold text-gray-700 mb-2">
              Author Name *
            </label>
            <input
              id="author"
              type="text"
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                errors.author ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
              }`}
              placeholder="Your name..."
            />
            {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
          </div>
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
          <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700 mb-2">
            Story Excerpt * ({formData.excerpt.length}/200)
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => handleInputChange('excerpt', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none ${
              errors.excerpt ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
            }`}
            rows="3"
            placeholder="A brief description of your story..."
            maxLength={200}
          />
          {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
            Full Story *
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none ${
              errors.content ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
            }`}
            rows="8"
            placeholder="Share your complete story here..."
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
        </div>

        <div className="flex gap-4 pt-4">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="gradient" onClick={handleSubmit} className="flex-1">
            Publish Story
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePostModal;
