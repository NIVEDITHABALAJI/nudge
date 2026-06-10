import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkspaces, createWorkspace } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const { data } = await getWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      const { data } = await createWorkspace({ name: newWorkspaceName });
      setWorkspaces([...workspaces, data.workspace]);
      setNewWorkspaceName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>⚡ Nudge</h1>
        <div style={styles.navRight}>
          <span style={styles.userName}>👋 {user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <h2 style={styles.heading}>Your Workspaces</h2>

        {/* Create Workspace */}
        <form onSubmit={handleCreateWorkspace} style={styles.createForm}>
          <input
            style={styles.input}
            type="text"
            placeholder="New workspace name..."
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
          />
          <button style={styles.createBtn} type="submit">+ Create</button>
        </form>

        {/* Workspace List */}
        {loading ? (
          <p>Loading workspaces...</p>
        ) : workspaces.length === 0 ? (
          <p style={styles.empty}>No workspaces yet — create your first one! 🚀</p>
        ) : (
          <div style={styles.grid}>
            {workspaces.map((ws) => (
              <div
                key={ws._id}
                style={styles.card}
                onClick={() => navigate(`/chat/${ws._id}`)}
              >
                <h3 style={styles.wsName}>{ws.name}</h3>
                <p style={styles.wsMeta}>{ws.members.length} member(s)</p>
                <p style={styles.wsInvite}>Invite: {ws.inviteCode}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px 32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  logo: { color: '#6366f1', margin: 0 },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  userName: { color: '#333', fontWeight: '500' },
  logoutBtn: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  main: { maxWidth: '900px', margin: '0 auto', padding: '32px 16px' },
  heading: { color: '#333', marginBottom: '24px' },
  createForm: { display: 'flex', gap: '12px', marginBottom: '32px' },
  input: { flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' },
  createBtn: { padding: '12px 24px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  empty: { color: '#888', textAlign: 'center', marginTop: '48px', fontSize: '18px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' },
  card: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'transform 0.2s', },
  wsName: { color: '#333', marginBottom: '8px' },
  wsMeta: { color: '#888', fontSize: '14px', marginBottom: '4px' },
  wsInvite: { color: '#6366f1', fontSize: '12px', fontFamily: 'monospace' }
};

export default Dashboard;