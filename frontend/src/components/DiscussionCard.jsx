import React from 'react';
import { Link } from 'react-router-dom';
import { FaThumbsUp, FaComment, FaEye } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const DiscussionCard = ({ discussion }) => {
  const voteScore = (discussion.upvotes?.length || 0) - (discussion.downvotes?.length || 0);

  return (
    <Link
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
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition">
              {discussion.title}
            </h3>
            
            <p className="text-gray-600 mb-3 line-clamp-2">
              {discussion.content?.substring(0, 150)}...
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
                <FaThumbsUp className="text-green-500" size={12} />
                <span>{voteScore}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <FaComment className="text-blue-500" size={12} />
                <span>{discussion.commentCount || 0}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <FaEye className="text-gray-400" size={12} />
                <span>{discussion.viewCount || 0}</span>
              </div>
              
              <span className="text-xs">
                {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DiscussionCard;