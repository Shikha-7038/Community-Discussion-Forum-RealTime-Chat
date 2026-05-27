import React from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const Comment = ({ comment, onVote, currentUser }) => {
  const voteScore = (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0);
  const userVote = currentUser?.id 
    ? comment.upvotes?.includes(currentUser.id) ? 'up' 
      : comment.downvotes?.includes(currentUser.id) ? 'down' 
      : null
    : null;

  return (
    <div className="border-b border-gray-100 last:border-0 py-4">
      <div className="flex items-start gap-3">
        <img
          src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${comment.author?.name}&background=random`}
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
          <p className="text-gray-700 mb-2">{comment.content}</p>
          
          {/* Voting buttons for comment */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onVote(comment._id, 'up')}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition ${
                userVote === 'up' 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <FaThumbsUp size={12} /> {comment.upvotes?.length || 0}
            </button>
            <button
              onClick={() => onVote(comment._id, 'down')}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition ${
                userVote === 'down' 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <FaThumbsDown size={12} /> {comment.downvotes?.length || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comment;