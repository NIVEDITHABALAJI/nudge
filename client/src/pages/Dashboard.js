import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkspaces, createWorkspace } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchWorkspaces(); }, []);

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
      toast.success('Workspace created! 🚀');
    } catch (err) {
      toast.error('Failed to create workspace');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const colors = ['from-indigo-500 to-purple-500', 'from-pink-500 to-rose-500', 'from-green-500 to-teal-500', 'from-orange-500 to-amber-500', 'from-blue-500 to-cyan-500'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">⚡ Nudge</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{user?.name}</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className="text-xl"
            title="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Your Workspaces</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Collaborate with your team in real-time</p>
        </div>

        {/* Create Workspace */}
        <form onSubmit={handleCreateWorkspace} className="flex gap-3 mb-10">
          <input
            className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            type="text"
            placeholder="New workspace name..."
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
          />
          <button
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
            type="submit"
          >
            + Create
          </button>
        </form>

        {/* Workspaces Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading workspaces...</div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🚀</p>
            <p className="text-gray-500 dark:text-gray-400 text-lg">No workspaces yet — create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws, index) => (
              <div
                key={ws._id}
                onClick={() => navigate(`/chat/${ws._id}`)}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className={`h-2 bg-gradient-to-r ${colors[index % colors.length]}`} />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{ws.name}</h3>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">{ws.members.length} member(s)</p>
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400">Invite:</span>
                    <span className="text-xs font-mono text-indigo-500 dark:text-indigo-400">{ws.inviteCode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;