import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const getPasswordStrength = (password) => {
  if (password.length === 0) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-400', width: 'w-1/4', text: 'text-red-500' };
  if (score === 2) return { label: 'Fair', color: 'bg-yellow-400', width: 'w-2/4', text: 'text-yellow-500' };
  if (score === 3) return { label: 'Good', color: 'bg-blue-400', width: 'w-3/4', text: 'text-blue-500' };
  return { label: 'Strong', color: 'bg-green-400', width: 'w-full', text: 'text-green-500' };
};

const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSuggestPassword = () => {
    const suggested = generatePassword();
    setFormData({ ...formData, password: suggested });
    setShowPassword(true);
    toast.success('Strong password suggested! 🔐');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (strength?.label === 'Weak') {
      toast.error('Please use a stronger password!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await registerUser(formData);
      login(data.user, data.token);
      toast.success('Account created successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">⚡ Nudge</h1>
          <p className="text-gray-500">Stay in sync. Without the noise.</p>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create your account</h2>
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            type="text"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Password field with visibility toggle */}
          <div className="relative">
            <input
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm pr-12"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition text-lg"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Password strength meter */}
          {strength && (
            <div className="space-y-1">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-medium ${strength.text}`}>
                  {strength.label} password
                </span>
                <button
                  type="button"
                  onClick={handleSuggestPassword}
                  className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                >
                  🔐 Suggest strong password
                </button>
              </div>
            </div>
          )}

          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition duration-200"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;