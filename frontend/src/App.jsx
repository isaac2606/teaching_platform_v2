import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { dashboardLoader , HubLoader} from "./loaders";
import { ThemeProvider } from "./context/ThemeContext";

import './App.css';
// TeacherFeed has been refactored into pages/GroupFeed.jsx and lazy loaded below


// Lazy loading pages for performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
// Note: TeacherHub has been refactored into pages/Dashboard.jsx!
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const HubWorkspaceLayout = lazy(() => import("./layouts/HubWorkspaceLayout"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const JoinHub = lazy(() => import("./pages/JoinHub"));
const FeedTab  = lazy(()=>import("./pages/tabs/FeedTab"))
const ChatTab  = lazy(()=>import("./pages/tabs/ChatTab"))
const ScheduleTab  = lazy(()=>import("./pages/tabs/ScheduleTab"))
const RosterTab  = lazy(()=>import("./pages/tabs/RosterTab"))

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
            id: "hub-workspace",
            path: "workspace/:id", 
            element: <Suspense fallback={<Loader />}><HubWorkspaceLayout  /></Suspense> ,
            loader: HubLoader,
            children:[
              {
                index:true , element: <Navigate to="feed" replace />
              },
              { path: "feed", element: <FeedTab></FeedTab> },
              { path: "chat", element: <ChatTab></ChatTab> },
              { path: "schedule", element: <ScheduleTab></ScheduleTab> },
              { path: "roster", element: <RosterTab></RosterTab>}
            ]
          }
        ]
      }
    ]
  },
  {
    path: "/join/:inviteToken",
    element: <ProtectedRoute><Suspense fallback={<Loader />}><JoinHub /></Suspense></ProtectedRoute>
  }
]);

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  );
}