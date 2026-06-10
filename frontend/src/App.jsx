import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import './App.css';
// TeacherFeed has been refactored into pages/GroupFeed.jsx and lazy loaded below


// Lazy loading pages for performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
// Note: TeacherHub has been refactored into pages/Dashboard.jsx!
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const GroupFeed = lazy(() => import("./pages/GroupFeed"));

// Fallback loader component
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen text-white bg-bg-base">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
  </div>
);



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
                
                {/* 
                  Notice how we are moving the nested routes from Dashboard.jsx 
                  into the main App.jsx router tree for a scalable architecture. 
                */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="groupFeed/:id" element={<GroupFeed />} />
                {/* Future pages can be added here */}
                {/* <Route path="groups" element={<Groups />} /> */}
                {/* <Route path="schedule" element={<Schedule />} /> */}
              </Route>
            </Route>
          </Routes>
        </Suspense>
      
    </AuthProvider>
  );
}