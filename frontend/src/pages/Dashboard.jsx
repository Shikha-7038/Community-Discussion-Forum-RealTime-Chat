import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaThumbsUp, FaComment, FaEye } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const categories = ['All', 'General', 'Technology', 'Programming', 'Gaming', 'Help', 'Announcements'];
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-viewCount', label: 'Most Viewed' },
    { value: '-commentCount', label: 'Most Discussed' }
  ];

  useEffect(() => {
    fetchDiscussions();
  }, [category, sortBy, pagination.page]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/discussions', {
        params: {
          page: pagination.page,
          category: category === 'All' ? undefined : category,
          sort: sortBy
        }
      });
      setDiscussions(response.data.discussions);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      }));
    } catch (error) {
      console.error('Failed to fetch discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getVoteScore = (discussion) => {
    return (discussion.upvotes?.length || 0) - (discussion.downvotes?.length || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Community Discussions</h1>
        <Link
          to="/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + New Discussion
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Discussions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : discussions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No discussions found. Be the first to create one!</p>
          <Link to="/create" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
            Create a discussion →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <Link
              key={discussion._id}
              to={`/discussion/${discussion._id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {discussion.category}
                      </span>
                      {discussion.isPinned && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          📌 Pinned
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                      {discussion.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {discussion.content.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <img
                          src={discussion.author?.avatar || `https://ui-avatars.com/api/?name=${discussion.author?.name}`}
                          alt={discussion.author?.name}
                          className="h-5 w-5 rounded-full"
                        />
                        <span>{discussion.author?.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <FaThumbsUp className="text-green-500" />
                        <span>{getVoteScore(discussion)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <FaComment className="text-blue-500" />
                        <span>{discussion.commentCount || 0}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <FaEye className="text-gray-400" />
                        <span>{discussion.viewCount || 0}</span>
                      </div>
                      
                      <span>
                        {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="px-3 py-1">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;