import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateDiscussion from './pages/CreateDiscussion';
import DiscussionDetail from './pages/DiscussionDetail';
import Chat from './pages/Chat';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/create" element={<PrivateRoute><CreateDiscussion /></PrivateRoute>} />
              <Route path="/discussion/:id" element={<PrivateRoute><DiscussionDetail /></PrivateRoute>} />
              <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;