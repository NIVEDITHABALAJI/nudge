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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchData();
    const newSocket = io('http://localhost:5000', { auth: { token } });
    setSocket(newSocket);
    newSocket.emit('join_workspace', workspaceId);
    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
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
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>
        <h2 style={styles.wsName}>⚡ {workspace?.name || 'Loading...'}</h2>
        <span style={styles.members}>{workspace?.members?.length} member(s)</span>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.length === 0 ? (
          <p style={styles.empty}>No messages yet — say hello! 👋</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              style={{
                ...styles.message,
                ...(msg.sender._id === user?.id ? styles.myMessage : styles.otherMessage)
              }}
            >
              {msg.sender._id !== user?.id && (
                <p style={styles.senderName}>{msg.sender.name}</p>
              )}
              <p style={styles.messageContent}>{msg.content}</p>
              <p style={styles.messageTime}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form style={styles.inputArea} onSubmit={sendMessage}>
        <input
          style={styles.input}
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button style={styles.sendBtn} type="submit">Send ⚡</button>
      </form>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#f0f2f5' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', background: 'white', padding: '16px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  backBtn: { padding: '8px 16px', background: '#f0f2f5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  wsName: { margin: 0, color: '#333', flex: 1 },
  members: { color: '#888', fontSize: '14px' },
  messages: { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' },
  empty: { textAlign: 'center', color: '#888', marginTop: '48px' },
  message: { maxWidth: '60%', padding: '12px 16px', borderRadius: '12px', wordBreak: 'break-word' },
  myMessage: { alignSelf: 'flex-end', background: '#6366f1', color: 'white', borderBottomRightRadius: '4px' },
  otherMessage: { alignSelf: 'flex-start', background: 'white', color: '#333', borderBottomLeftRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' },
  senderName: { fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#6366f1' },
  messageContent: { margin: 0, fontSize: '14px' },
  messageTime: { margin: 0, fontSize: '11px', opacity: 0.7, marginTop: '4px', textAlign: 'right' },
  inputArea: { display: 'flex', gap: '12px', padding: '16px 24px', background: 'white', boxShadow: '0 -2px 8px rgba(0,0,0,0.08)' },
  input: { flex: 1, padding: '12px 16px', border: '1px solid #ddd', borderRadius: '24px', fontSize: '14px', outline: 'none' },
  sendBtn: { padding: '12px 24px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: '600' }
};

export default Chat;