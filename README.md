# 💬 Community Discussion Forum with Real-Time Chat

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![MERN](https://img.shields.io/badge/MERN-Stack-green)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-orange)
![License](https://img.shields.io/badge/license-MIT-yellow)

## 📌 Project Overview

A **full-stack community platform** that combines the best of both worlds - asynchronous discussion forums with real-time chat functionality. Built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for real-time communication.

### 🎯 What Problem Does It Solve?

Traditional forums lack real-time interaction, while chat platforms don't support structured discussions. This platform bridges that gap by providing:

- **Structured Discussions** - Create topics, get threaded comments, upvote/downvote content
- **Real-Time Chat** - Instant messaging with presence indicators and typing status
- **Unified Experience** - One platform for both asynchronous and synchronous communication

### 👥 Who Is This For?

- **Students** - Collaborate on projects, ask questions, share resources
- **Communities** - Build engaged online communities with meaningful discussions
- **Companies** - Internal communication + knowledge base in one place
- **Open Source Projects** - Contributor discussions + real-time collaboration

---

## ✨ Key Features

### 📝 Forum Features
- ✅ User Registration & Authentication (JWT)
- ✅ Create, Read, Update, Delete Discussions
- ✅ Category-based Organization (General, Technology, Programming, Gaming, Help, Announcements)
- ✅ Comment System with Threaded Replies
- ✅ Upvote/Downvote System for Posts & Comments
- ✅ View Count Tracking
- ✅ Search & Filter by Category
- ✅ Pagination for Discussions

### 💬 Real-Time Chat Features
- ✅ Multiple Chat Rooms (general, technology, random, help)
- ✅ Real-Time Message Delivery (Socket.IO)
- ✅ Online/Offline User Presence
- ✅ Typing Indicators
- ✅ Message History (last 50 messages per room)
- ✅ Room Join/Leave Notifications

### 🎨 UI/UX Features
- ✅ Responsive Design (Tailwind CSS)
- ✅ User Avatars (Auto-generated)
- ✅ Loading States & Animations
- ✅ Error Handling & Validation
- ✅ Toast Notifications

---

## 🏗️ Architecture
### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│ Client (React) │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Dashboard│ │ Create │ │ Discussion│ │ Chat │ │
│ │ │ │ Post │ │ Detail │ │ Room │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────┘
│
┌─────────┴─────────┐
│ REST APIs │
│ Socket.IO │
└─────────┬─────────┘
│
┌─────────────────────────────────────────────────────────────┐
│ Backend (Node.js) │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Auth │ │ Discussion│ │ Comment │ │ Socket │ │
│ │ Routes │ │ Routes │ │ Routes │ │ Handler │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ MongoDB (Database) │ │
│ │ Users │ Discussions │ Comments │ Messages │ │
│ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### API Flow
Client Request → Express Server → Middleware (Auth) → Controller → Model → Database → Response

### Socket.IO Communication Flow
Client A → Socket.IO Server → Broadcast → Client B (real-time)
↓
Database (Message Storage)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **React Router DOM v6** | Client-side Routing |
| **Axios** | HTTP Requests |
| **Socket.IO Client** | Real-time Communication |
| **Tailwind CSS** | Styling |
| **React Icons** | Icons |
| **date-fns** | Date Formatting |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime Environment |
| **Express.js** | Web Framework |
| **MongoDB** | Database |
| **Mongoose** | ODM for MongoDB |
| **Socket.IO** | WebSocket Server |
| **JWT** | Authentication |
| **bcryptjs** | Password Hashing |
| **cors** | Cross-Origin Resource Sharing |
| **dotenv** | Environment Variables |

---

```
## 📁 Folder Structure
Community-Discussion-Forum-RealTime-Chat/
│
├── backend/
│ ├── src/
│ │ ├── models/
│ │ │ ├── User.js
│ │ │ ├── Discussion.js
│ │ │ ├── Comment.js
│ │ │ └── Message.js
│ │ ├── routes/
│ │ │ ├── auth.js
│ │ │ ├── discussions.js
│ │ │ └── comments.js
│ │ ├── controllers/
│ │ ├── middleware/
│ │ │ └── auth.js
│ │ ├── sockets/
│ │ │ └── chatSocket.js
│ │ └── config/
│ ├── .env
│ ├── .env.example
│ ├── package.json
│ └── server.js
│
├── frontend/
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── components/
│ │ │ ├── Navbar.jsx
│ │ │ ├── PrivateRoute.jsx
│ │ │ ├── DiscussionCard.jsx
│ │ │ └── Comment.jsx
│ │ ├── pages/
│ │ │ ├── Login.jsx
│ │ │ ├── Register.jsx
│ │ │ ├── Dashboard.jsx
│ │ │ ├── CreateDiscussion.jsx
│ │ │ ├── DiscussionDetail.jsx
│ │ │ └── Chat.jsx
│ │ ├── context/
│ │ │ ├── AuthContext.jsx
│ │ │ └── SocketContext.jsx
│ │ ├── services/
│ │ │ └── api.js
│ │ ├── sockets/
│ │ │ └── socket.js
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── package.json
│ ├── vite.config.js
│ └── tailwind.config.js
│
├── docs/
│ └── screenshots/
├── .gitignore
└── README.md
```
---

## 🚀 Installation Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Local installation OR MongoDB Atlas account (free)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/Community-Discussion-Forum-RealTime-Chat.git
cd Community-Discussion-Forum-RealTime-Chat

Step 2: Backend Setup
bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your MongoDB URI
# Open .env and add your MongoDB connection string

# Start backend server
npm run dev
Backend will run on: http://localhost:5000

Step 3: Frontend Setup
bash
# Open a new terminal
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
Frontend will run on: http://localhost:5173

Step 4: MongoDB Setup (MongoDB Atlas - FREE)
Go to MongoDB Atlas

Sign up for a free account

Create a new cluster (FREE tier)

Click "Connect" → "Connect your application"

Copy the connection string

Paste it in your backend/.env file:

env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/community_forum
JWT_SECRET=your_super_secret_key_change_this
CLIENT_URL=http://localhost:5173

Step 5: Environment Variables
Backend .env file:

env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
Frontend doesn't need a separate .env as it uses Vite proxy

🎮 How to Use the Application
1. Register a New Account
https://docs/screenshots/register.png

Click "create a new account" on login page

Fill in your name, email, and password (min 6 characters)

Click "Sign up"

2. Login
https://docs/screenshots/login.png

Enter your email and password

Click "Sign in"

3. Browse Discussions (Dashboard)
https://docs/screenshots/dashboard.png

View all discussions on the home page

Filter by category (General, Technology, Programming, etc.)

Sort by newest, oldest, most viewed, or most discussed

Click on any discussion to view details

4. Create a New Discussion
https://docs/screenshots/create-discussion.png

Click "New Post" button in navbar

Enter title, select category, write content

Add optional tags (comma-separated)

Click "Post Discussion"

5. View and Interact with Discussions
https://docs/screenshots/discussion-detail.png

Read the full discussion content

Upvote/Downvote the discussion

View comments from other users

Add your own comments

6. Real-Time Chat
https://docs/screenshots/chat.png

Click "Chat" in the navbar

Select a chat room (general, technology, random, help)

Send real-time messages

See who's online

View typing indicators
```
---

## 📈 Learning Outcomes
After completing this project, you will understand:

## Technical Skills
 - ✅ Full-stack development with MERN stack
 - ✅ Real-time communication using Socket.IO
 - ✅ JWT authentication & authorization
 - ✅ RESTful API design
 - ✅ MongoDB schema design & relationships
 - ✅ State management with React Context
 - ✅ WebSocket connection handling
 - ✅ Environment variable management

## Soft Skills
 - ✅ Project architecture planning
 - ✅ Debugging full-stack applications
 - ✅ Git version control best practices
 - ✅ Code documentation
 - ✅ Problem-solving in real-time systems

## 🚀 Future Enhancements
Ideas to extend this project:
 - **Voice/Video Calls** - Add WebRTC integration
 - **File Uploads** - Images, documents in discussions and chat
 - **Email Notifications** - Send email for mentions/replies
 - **User Profiles** - Edit profile, view activity history
 - **Moderation Panel** - Admin dashboard to manage content
 - **Markdown Support** - Rich text editing for discussions
 - **Search Functionality** - Search discussions and messages
 - **Private Messages (DMs)** - One-on-one private chat
 - **Push Notifications** - Browser notifications
 - **Mobile App** - React Native version