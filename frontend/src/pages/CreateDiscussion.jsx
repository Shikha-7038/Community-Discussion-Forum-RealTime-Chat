import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateDiscussion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['General', 'Technology', 'Programming', 'Gaming', 'Help', 'Announcements'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await axios.post('/api/discussions', {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: tagsArray
      });
      
      navigate(`/discussion/${response.data.discussion._id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create discussion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Create New Discussion</h1>
          <p className="text-gray-600 mt-1">Share your thoughts with the community</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's your question or topic?"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              maxLength="200"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="10"
              placeholder="Write your discussion content here... Markdown supported"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="react, javascript, help, question"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate tags with commas
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Post Discussion'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDiscussion;