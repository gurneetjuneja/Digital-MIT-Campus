import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { GatePassProvider } from './contexts/GatePassContext';

// Layout Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Setup from './pages/Setup';
import SecurityDashboard from './pages/security/Dashboard';
import SecurityHistory from './pages/security/History';
import CreateGatePass from './pages/security/CreateGatePass';
import ViewGatePass from './pages/common/ViewGatePass';
import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyHistory from './pages/faculty/History';
import FacultyApproval from './pages/faculty/ApproveGatePass';
import AdminDashboard from './pages/admin/Dashboard';
import AdminApproval from './pages/admin/ApproveGatePass';
import PendingApprovals from './pages/admin/PendingApprovals';
import Users from './pages/admin/Users';
import EditUser from './pages/admin/EditUser';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <GatePassProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />
            
            {/* Security Routes */}
            <Route 
              path="/security" 
              element={
                <ProtectedRoute allowedRoles={['security']}>
                  <SecurityDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/security/create-pass" 
              element={
                <ProtectedRoute allowedRoles={['security']}>
                  <CreateGatePass />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/security/history" 
              element={
                <ProtectedRoute allowedRoles={['security']}>
                  <SecurityHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/security/reapprove/:id" 
              element={
                <ProtectedRoute allowedRoles={['security']}>
                  <CreateGatePass isReapproval={true} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/security/view/:id" 
              element={
                <ProtectedRoute allowedRoles={['security']}>
                  <ViewGatePass />
                </ProtectedRoute>
              } 
            />
            
            {/* Faculty Routes */}
            <Route 
              path="/faculty" 
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/faculty/approve/:id" 
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyApproval />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/faculty/history" 
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/faculty/view/:id" 
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <ViewGatePass />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/pending" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PendingApprovals />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Users />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/edit-user" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EditUser />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/approve/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminApproval />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/view/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ViewGatePass />
                </ProtectedRoute>
              } 
            />
            
            {/* Root and Not found */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4aed88',
                }
              },
            }}
          />
        </Router>
      </GatePassProvider>
    </AuthProvider>
  );
}

export default App;