import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import './App.css';

// Lazy loading pages for performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TeacherHub = lazy(() => import("../hub/TeacherHub"));

// We will build Login/Register soon. For now they are placeholders.
const Login = () => <div className="text-white p-8">Login Page (Coming Soon)</div>;
const Register = () => <div className="text-white p-8">Register Page (Coming Soon)</div>;

// Fallback loader component
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen text-white bg-neutral-800">
    Loading...
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
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* 
              Notice how we are moving the nested routes from Dashboard.jsx 
              into the main App.jsx router tree for a scalable architecture. 
            */}
            <Route path="dashboard" element={<TeacherHub />} />
            
            {/* Future pages can be added here */}
            {/* <Route path="groups" element={<Groups />} /> */}
            {/* <Route path="schedule" element={<Schedule />} /> */}
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}