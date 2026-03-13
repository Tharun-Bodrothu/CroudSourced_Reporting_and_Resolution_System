import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => API.post('/auth/login', { email, password }),
  register: (name, email, phone, password) => 
    API.post('/auth/register', { name, email, phone, password }),
};


export const issuesAPI = {
  createIssue: (issueData) => {
    // If it's FormData, don't set Content-Type (let browser set it)
    if (issueData instanceof FormData) {
      return API.post('/issues/create', issueData);
    }
    // Otherwise, send as JSON
    return API.post('/issues/create', issueData, {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  getAllIssues: () => API.get('/issues/all'),
  getPriorityRanking: () => API.get('/issues/priority-ranking'),
  getAnalytics: () => API.get('/issues/analytics'),
};

export const adminAPI = {
  getAnalytics: () => API.get('/admin/analytics'),
  getIssues: () => API.get('/admin/issues'),
  getDepartments: () => API.get('/admin/departments'),
  createDepartment: (payload) => API.post('/admin/departments', payload),
  updateDepartment: (id, payload) => API.put(`/admin/departments/${id}`, payload),
  getUsers: () => API.get('/admin/users'),
};

export const departmentAPI = {
  getMyIssues: () => API.get('/department/issues'),
  updateIssueStatus: (formData) =>
    API.put('/department/update-status', formData),
};

export default API;