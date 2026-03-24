import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';

import { LoginPage, RegisterPage } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import ReportIssuePage from './pages/ReportIssuePage';
import IssuesList from './pages/IssuesList';
import IssueDetails from './pages/IssueDetails';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageUsers from './pages/admin/ManageUsers';
import CreateDepartmentAdmin from './pages/admin/CreateDepartmentAdmin';
import SystemAnalytics from './pages/admin/SystemAnalytics';

// ✅ Department admin pages
import DepartmentDashboard from './pages/admin/DepartmentDashboard';
import DepartmentAbout from './pages/admin/DepartmentAbout';

import MapView from './pages/user/MapView';
import MyComplaints from './pages/user/MyComplaints';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-main">
        <Routes>

          {/* ── Public ── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Citizen ── */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/issues"    element={<ProtectedRoute><IssuesList /></ProtectedRoute>} />
          <Route path="/issues/:id" element={<ProtectedRoute><IssueDetails /></ProtectedRoute>} />
          <Route path="/report"    element={<ProtectedRoute><RoleRoute allowedRoles={['user','citizen']}><ReportIssuePage /></RoleRoute></ProtectedRoute>} />
          <Route path="/map"       element={<ProtectedRoute><RoleRoute allowedRoles={['user','citizen']}><MapView /></RoleRoute></ProtectedRoute>} />
          <Route path="/my-complaints" element={<ProtectedRoute><RoleRoute allowedRoles={['user','citizen']}><MyComplaints /></RoleRoute></ProtectedRoute>} />

          {/* ── Admin ── */}
          <Route path="/admin"           element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/departments" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><ManageDepartments /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/users"     element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><ManageUsers /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/create-department-admin" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><CreateDepartmentAdmin /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><SystemAnalytics /></RoleRoute></ProtectedRoute>} />

          {/* ── Department admin ── */}
          <Route path="/department"       element={<ProtectedRoute><RoleRoute allowedRoles={['department_admin','admin']}><DepartmentDashboard /></RoleRoute></ProtectedRoute>} />
          <Route path="/department/about" element={<ProtectedRoute><RoleRoute allowedRoles={['department_admin','admin']}><DepartmentAbout /></RoleRoute></ProtectedRoute>} />

          {/* ── Default ── */}
          <Route path="/" element={<ProtectedRoute><RoleBasedRedirect /></ProtectedRoute>} />

        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;