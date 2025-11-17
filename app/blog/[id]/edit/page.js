'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../../components/layout/Header';
import Button from '../../../../components/ui/Button';
import { postsAPI } from '../../../../lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CATEGORIES } from '../../../../data/constants';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;

  const [formData, setFormData] = useState({
    title: '',
    category: 'technology',
    content: '',
    tags: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          router.push('/');
          return;
        }

        const postData = await postsAPI.getPost(postId);
        if (postData.success && postData.post) {
          const post = postData.post;
          
          // Check if current user is the author
          if (post.author._id !== userId) {
            router.push('/');
            return;
          }

          setFormData({
            title: post.title,
            category: post.category,
            content: post.content,
            tags: post.tags?.join(', ') || ''
          });
        }
      } catch (error) {
        console.error('Failed to load post:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, router]);

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
    
    setSaving(true);
    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await postsAPI.updatePost(
        postId,
        formData.title,
        formData.content,
        formData.category,
        tags
      );

      if (response.success) {
        router.push(`/blog/${postId}`);
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to update post' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center text-white">Loading post...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 pb-40">
        {/* Back Button */}
        <Link href={`/blog/${postId}`} className="inline-flex items-center gap-2 text-white hover:text-pink-200 mb-6 transition-colors">
          <ArrowLeft size={20} />
          Back to Post
        </Link>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Your Story</h1>

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
                rows="15"
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
              <Link href={`/blog/${postId}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button variant="gradient" onClick={handleSubmit} className="flex-1" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
