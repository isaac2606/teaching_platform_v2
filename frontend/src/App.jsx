import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { dashboardLoader } from "./loaders";

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



import { useLoaderData } from "react-router-dom";
function RoleBasedDashboardWrapper() {
  const data = useLoaderData();
  return data?.role === "teacher" ? <Dashboard /> : <StudentDashboard />;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Suspense fallback={<Loader />}><Login /></Suspense>,
  },
  {
    path: "/register",
    element: <Suspense fallback={<Loader />}><Register /></Suspense>,
  },
  {
    path: "/",
    element: <ProtectedRoute />, // Wrap everything in ProtectedRoute
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { 
            path: "dashboard", 
            element: <Suspense fallback={<Loader />}><RoleBasedDashboardWrapper /></Suspense>,
            loader: dashboardLoader
          },
          { 
            path: "groupFeed/:id", 
            element: <Suspense fallback={<Loader />}><GroupFeed /></Suspense> 
          }
        ]
      }
    ]
  },
  {
    path: "/join/:inviteToken",
    element: <ProtectedRoute><Suspense fallback={<Loader />}><JoinGroup /></Suspense></ProtectedRoute>
  }
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}