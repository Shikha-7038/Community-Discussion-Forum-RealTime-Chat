import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaSignOutAlt, FaComments, FaHome } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-blue-600">CommunityForum</span>
            </Link>
            
            <div className="hidden md:flex ml-6 space-x-4">
              <Link to="/" className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-gray-900">
                <FaHome size={16} /> Dashboard
              </Link>
              <Link to="/chat" className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-gray-900">
                <FaComments size={16} /> Chat
              </Link>
              <Link to="/create" className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <FaPlus size={12} /> New Post
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                alt={user.name}
                className="h-8 w-8 rounded-full"
              />
              <span className="text-sm text-gray-700 hidden md:inline">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaSignOutAlt size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;