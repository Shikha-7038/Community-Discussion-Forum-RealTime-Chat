import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FaThumbsUp, FaThumbsDown, FaComment, FaShare, FaFlag, FaEdit, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const DiscussionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userVote, setUserVote] = useState(null);

  useEffect(() => {
    fetchDiscussion();
    
    // Join discussion room for real-time comments
    if (socket) {
      socket.emit('joinDiscussion', id);
      
      socket.on('newComment', (data) => {
        if (data.discussionId === id) {
          setComments(prev => [data.comment, ...prev]);
          // Update comment count
          setDiscussion(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev);
        }
      });
      
      return () => {
        socket.emit('leaveDiscussion', id);
        socket.off('newComment');
      };
    }
  }, [id, socket]);

  const fetchDiscussion = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/discussions/${id}`);
      setDiscussion(response.data.discussion);
      setComments(response.data.comments || []);
      
      // Check if user has voted
      if (user) {
        const hasUpvoted = response.data.discussion.upvotes?.includes(user.id);
        const hasDownvoted = response.data.discussion.downvotes?.includes(user.id);
        if (hasUpvoted) setUserVote('up');
        else if (hasDownvoted) setUserVote('down');
        else setUserVote(null);
      }
    } catch (error) {
      console.error('Failed to fetch discussion:', error);
      if (error.response?.status === 404) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await axios.post(`/api/discussions/${id}/vote`, { voteType });
      setDiscussion(prev => ({
        ...prev,
        upvotes: voteType === 'up' && userVote !== 'up' 
          ? [...(prev.upvotes || []), user.id]
          : voteType === 'up' && userVote === 'up'
          ? (prev.upvotes || []).filter(uid => uid !== user.id)
          : (prev.upvotes || []).filter(uid => uid !== user.id),
        downvotes: voteType === 'down' && userVote !== 'down'
          ? [...(prev.downvotes || []), user.id]
          : voteType === 'down' && userVote === 'down'
          ? (prev.downvotes || []).filter(uid => uid !== user.id)
          : (prev.downvotes || []).filter(uid => uid !== user.id)
      }));
      
      if (userVote === voteType) {
        setUserVote(null);
      } else {
        setUserVote(voteType);
      }
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await axios.post('/api/comments', {
        content: newComment,
        discussionId: id
      });
      
      setComments(prev => [response.data.comment, ...prev]);
      setNewComment('');
      setDiscussion(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!window.confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/discussions/${id}`);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete discussion:', error);
      alert(error.response?.data?.message || 'Failed to delete discussion');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Discussion not found</h2>
        <Link to="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const voteScore = (discussion.upvotes?.length || 0) - (discussion.downvotes?.length || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Discussion Post */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {discussion.category}
              </span>
              {discussion.isPinned && (
                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  📌 Pinned
                </span>
              )}
            </div>
            
            {user && discussion.author?._id === user.id && (
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteDiscussion}
                  className="text-red-600 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{discussion.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <img
                src={discussion.author?.avatar || `https://ui-avatars.com/api/?name=${discussion.author?.name}`}
                alt={discussion.author?.name}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <div className="font-medium text-gray-900">{discussion.author?.name}</div>
                <div>{formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}</div>
              </div>
            </div>
            
            {discussion.updatedAt !== discussion.createdAt && (
              <div className="text-xs">
                Edited {formatDistanceToNow(new Date(discussion.updatedAt), { addSuffix: true })}
              </div>
            )}
          </div>
          
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{discussion.content}</p>
          </div>
          
          {/* Voting Section */}
          <div className="flex items-center gap-4 border-t pt-4">
            <button
              onClick={() => handleVote('up')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition ${
                userVote === 'up' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaThumbsUp /> {discussion.upvotes?.length || 0}
            </button>
            
            <button
              onClick={() => handleVote('down')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition ${
                userVote === 'down' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaThumbsDown /> {discussion.downvotes?.length || 0}
            </button>
            
            <div className="flex items-center gap-1 text-gray-500">
              <FaComment /> {discussion.commentCount || 0} Comments
            </div>
          </div>
        </div>
      </div>
      
      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Comments ({comments.length})
          </h2>
        </div>
        
        {/* Add Comment Form */}
        {user && (
          <div className="p-6 border-b">
            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Comments List */}
        <div className="divide-y">
          {comments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="p-6">
                <div className="flex items-start gap-3">
                  <img
                    src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${comment.author?.name}`}
                    alt={comment.author?.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{comment.author?.name}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      {comment.isEdited && (
                        <span className="text-xs text-gray-400">(edited)</span>
                      )}
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;