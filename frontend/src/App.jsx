import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import './App.css';
// TeacherFeed has been refactored into pages/GroupFeed.jsx and lazy loaded below


// Lazy loading pages for performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
// Note: TeacherHub has been refactored into pages/Dashboard.jsx!
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const GroupFeed = lazy(() => import("./pages/GroupFeed"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const JoinGroup = lazy(() => import("./pages/JoinGroup"));

// Fallback loader component
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen text-white bg-bg-base">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
  </div>
);

// We must create a small wrapper component here because we cannot use AuthContext 
// inside the same App component that provides the AuthProvider!
function RoleBasedDashboard() {
  const { user } = useContext(AuthContext);
  return user?.role === "teacher" ? <Dashboard /> : <StudentDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes inside the Layout */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* 1. THE DASHBOARD ROUTE (Using our new wrapper) */}
                <Route path="dashboard" element={<RoleBasedDashboard />} />
                
                <Route path="groupFeed/:id" element={<GroupFeed />} />
              </Route>
            </Route>

            {/* 2. THE JOIN ROUTE (This only loads the JoinGroup teleporter) */}
            <Route path="/join/:inviteToken" element={
              <ProtectedRoute>
                <JoinGroup />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
    </AuthProvider>
  );
}