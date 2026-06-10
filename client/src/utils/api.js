import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Automatically attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

// Workspaces
export const getWorkspaces = () => API.get('/workspaces');
export const createWorkspace = (data) => API.post('/workspaces', data);
export const getWorkspace = (id) => API.get(`/workspaces/${id}`);

// Messages
export const getMessages = (workspaceId) => API.get(`/messages/${workspaceId}`);