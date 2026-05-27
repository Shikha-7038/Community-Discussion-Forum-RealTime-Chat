import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaHashtag } from 'react-icons/fa';

const Chat = () => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState({});
  const [currentRoom, setCurrentRoom] = useState('general');
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [connectionAttempted, setConnectionAttempted] = useState(false);

  const rooms = ['general', 'technology', 'random', 'help'];

  // Debug logging
  useEffect(() => {
    console.log('=== CHAT PAGE DEBUG ===');
    console.log('Socket object:', socket);
    console.log('Is connected:', isConnected);
    console.log('User:', user?.email);
    console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
    setConnectionAttempted(true);
  }, [socket, isConnected, user]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ Chat: No socket object yet');
      return;
    }

    if (!isConnected) {
      console.log('⚠️ Chat: Socket exists but not connected yet');
      return;
    }

    console.log('✅ Chat: Socket is connected! Setting up event listeners');

    const handleNewMessage = (message) => {
      console.log('💬 New message received:', message);
      setMessages(prev => ({
        ...prev,
        [message.room]: [...(prev[message.room] || []), message]
      }));
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePreviousMessages = ({ room, messages: prevMessages }) => {
      console.log(`📚 Received ${prevMessages?.length || 0} previous messages for ${room}`);
      setMessages(prev => ({
        ...prev,
        [room]: prevMessages || []
      }));
    };

    const handleUserTyping = ({ userId, name, isTyping }) => {
      setTypingUsers(prev => ({
        ...prev,
        [userId]: { name, isTyping }
      }));
      setTimeout(() => {
        setTypingUsers(prev => ({
          ...prev,
          [userId]: { ...prev[userId], isTyping: false }
        }));
      }, 1500);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('previousMessages', handlePreviousMessages);
    socket.on('userTyping', handleUserTyping);
    
    // Join current room
    console.log(`🚪 Joining room: ${currentRoom}`);
    socket.emit('joinRoom', currentRoom);

    return () => {
      console.log(`🚪 Leaving room: ${currentRoom}`);
      socket.emit('leaveRoom', currentRoom);
      socket.off('newMessage', handleNewMessage);
      socket.off('previousMessages', handlePreviousMessages);
      socket.off('userTyping', handleUserTyping);
    };
  }, [socket, isConnected, currentRoom]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (!socket || !isConnected) {
      console.log('❌ Cannot send: socket not connected');
      alert('Not connected to chat. Please refresh the page.');
      return;
    }
    
    console.log(`📤 Sending message to ${currentRoom}:`, newMessage);
    socket.emit('sendMessage', {
      room: currentRoom,
      content: newMessage.trim()
    });
    setNewMessage('');
  };

  const handleTyping = () => {
    if (!socket || !isConnected) return;
    
    socket.emit('typing', {
      room: currentRoom,
      isTyping: true
    });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit('typing', { room: currentRoom, isTyping: false });
      }
    }, 1000);
  };

  const currentMessages = messages[currentRoom] || [];

  // Show loading if still trying to connect (but not for too long)
  if (!connectionAttempted || (!socket && !isConnected)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Initializing Connection...</h2>
          <p className="text-gray-500">Setting up chat service</p>
          <div className="mt-4 animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Room Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-lg">Chat Rooms</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {rooms.map((room) => (
            <button
              key={room}
              onClick={() => setCurrentRoom(room)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition flex items-center gap-2 ${
                currentRoom === room ? 'bg-gray-700' : ''
              }`}
            >
              <FaHashtag />
              <span>#{room}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="bg-white border-b px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaHashtag className="text-gray-400" />
            {currentRoom}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentMessages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              No messages yet. Start the conversation!
            </div>
          ) : (
            currentMessages.map((msg, idx) => (
              <div
                key={msg._id || idx}
                className={`flex items-start gap-3 ${
                  msg.sender?._id === user?.id ? 'flex-row-reverse' : ''
                }`}
              >
                <img
                  src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.name || 'User'}`}
                  alt={msg.sender?.name}
                  className="h-8 w-8 rounded-full"
                />
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.sender?._id === user?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border shadow-sm'
                  }`}
                >
                  {msg.sender?._id !== user?.id && (
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      {msg.sender?.name || 'Anonymous'}
                    </div>
                  )}
                  <p className="break-words">{msg.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      msg.sender?._id === user?.id ? 'text-blue-200' : 'text-gray-400'
                    }`}
                  >
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : 'Just now'}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {Object.values(typingUsers).some(t => t.isTyping) && (
            <div className="text-sm text-gray-500 italic">
              {Object.values(typingUsers)
                .filter(t => t.isTyping)
                .map(t => t.name)
                .join(', ')} is typing...
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="bg-white border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyUp={handleTyping}
              placeholder={`Message #${currentRoom}`}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="bg-blue-600 text-white rounded-full px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;