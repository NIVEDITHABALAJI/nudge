import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMessages, getWorkspace } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const Chat = () => {
  const { workspaceId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [workspace, setWorkspace] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchData();
    const newSocket = io('http://localhost:5000', { auth: { token } });
    setSocket(newSocket);
    newSocket.emit('join_workspace', workspaceId);
    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });
    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });
    return () => newSocket.disconnect();
  }, [workspaceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchData = async () => {
    try {
      const [messagesRes, workspaceRes] = await Promise.all([
        getMessages(workspaceId),
        getWorkspace(workspaceId)
      ]);
      setMessages(messagesRes.data);
      setWorkspace(workspaceRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;
    socket.emit('send_message', { workspaceId, content: newMessage });
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-indigo-600 transition text-sm font-medium"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate(`/tasks/${workspaceId}`)}
          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-lg transition"
        >
          📋 Tasks
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800">⚡ {workspace?.name || 'Loading...'}</h2>
          <p className="text-xs text-gray-400">{workspace?.members?.length} member(s)</p>
        </div>
        <div className="flex items-center gap-3">
  <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
    <span className="text-xs text-green-600 font-medium">
      {onlineUsers.length} online
    </span>
  </div>
  <div className="flex -space-x-2">
    {onlineUsers.slice(0, 4).map((u, i) => (
      <div
        key={i}
        className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
        title={u.name}
      >
        {u.name?.charAt(0).toUpperCase()}
      </div>
    ))}
  </div>
</div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-4xl mb-3">👋</p>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Say hello to your team!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === user?.id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isMe && (
                    <span className="text-xs text-indigo-500 font-semibold mb-1 ml-1">
                      {msg.sender.name}
                    </span>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 mx-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-6 py-4">
        <form onSubmit={sendMessage} className="flex gap-3 items-center">
          <input
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
            type="submit"
          >
            ⚡ Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;