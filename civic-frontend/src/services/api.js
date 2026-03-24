import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to all requests
API.interceptors.request.use((config) => {
  const raw = localStorage.getItem('token');
  if (raw) {
    // Normalize: always send as "Bearer <token>"
    const token = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
    config.headers.Authorization = token;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => API.post('/auth/login', { email, password }),
  register: (name, email, phone, password) =>
    API.post('/auth/register', { name, email, phone, password }),
};

// ─────────────────────────────────────────────
// ISSUES (citizen + shared)
// ─────────────────────────────────────────────
export const issuesAPI = {
  createIssue: (issueData) => {
    if (issueData instanceof FormData) {
      return API.post('/issues/create', issueData);
    }
    return API.post('/issues/create', issueData, {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  getAllIssues: () => API.get('/issues/all'),
  getMyIssues: () => API.get('/issues/mine'),
  getIssueById: (id) => API.get(`/issues/${id}`),
  getPriorityRanking: () => API.get('/issues/priority-ranking'),
  getAnalytics: () => API.get('/issues/analytics'),
};

// ─────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────
export const adminAPI = {
  // Dashboard + analytics
  getAnalytics: () => API.get('/admin/analytics'),
  // Issues
  getIssues: () => API.get('/admin/issues'),
  updateIssueStatus: (issueId, status) =>
    API.put(`/admin/issues/${issueId}/status`, { status }),
  assignDepartment: (issueId, departmentId) =>
    API.put('/admin/assign-department', { issueId, departmentId }),
  // Departments
  getDepartments: () => API.get('/admin/departments'),
  createDepartment: (payload) => API.post('/admin/departments', payload),
  updateDepartment: (id, payload) => API.put(`/admin/departments/${id}`, payload),
  // Users
  getUsers: () => API.get('/admin/users'),
  createDepartmentAdmin: (payload) => API.post('/admin/department-admins', payload),
  setUserActive: (payload) => API.put('/admin/users/active', payload),
};

// ─────────────────────────────────────────────
// DEPARTMENT ADMIN
// ─────────────────────────────────────────────
export const departmentAPI = {
  getMyIssues: () => API.get('/department/issues'),
  getStats: () => API.get('/department/stats'),
  updateIssueStatus: (issueId, status, afterImageFile) => {
    const form = new FormData();
    form.append('issueId', issueId);
    form.append('status', status);
    if (afterImageFile) form.append('afterImage', afterImageFile);
    return API.put('/department/update-status', form);
  },
};

export default API;