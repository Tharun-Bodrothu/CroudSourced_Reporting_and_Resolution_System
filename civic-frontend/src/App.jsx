import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ReportIssuePage from './pages/ReportIssuePage';
import IssuesList from './pages/IssuesList';
// Role-specific pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DepartmentDashboard from './pages/admin/DepartmentDashboard';
import IssuesFeed from './pages/user/IssuesFeed';
import MapView from './pages/user/MapView';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-main">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues"
            element={
              <ProtectedRoute>
                <IssuesList />
              </ProtectedRoute>
            }
          />
          {/* User-specific views */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["user"]}>
                  <IssuesFeed />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["user"]}>
                  <MapView />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportIssuePage />
              </ProtectedRoute>
            }
          />

          {/* Admin / Department routes (role-protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/department"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["department_admin", "admin"]}>
                  <DepartmentDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;