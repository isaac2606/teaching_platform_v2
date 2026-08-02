import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { dashboardLoader , HubLoader,AllStudentsLoader,StudentsLoader} from "./loaders";
import { ThemeProvider } from "./context/ThemeContext";
import { SocketProvider } from "./context/SocketContext";
import './App.css';
// TeacherFeed has been refactored into pages/GroupFeed.jsx and lazy loaded below


// Lazy loading pages for performance
const LandingPage = lazy(() => import("./pages/public/LandingPage"));
const GlobalSearch = lazy(() => import("./pages/public/GlobalSearch"));
const TeacherProfile = lazy(() => import("./pages/public/TeacherProfile"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const HubWorkspaceLayout = lazy(() => import("./layouts/HubWorkspaceLayout"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const JoinHub = lazy(() => import("./features/hubs/JoinHub"));
const FeedTab = lazy(() => import("./pages/tabs/FeedTab"));
const ChatTab = lazy(() => import("./pages/tabs/ChatTab"));
const ScheduleTab = lazy(() => import("./pages/tabs/ScheduleTab"));
const RosterTab = lazy(() => import("./pages/tabs/RosterTab"));
const VaultTab = lazy(() => import("./pages/tabs/VaultTab"));

// Fallback loader component
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen text-white bg-bg-base">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
  </div>
);

import { useLoaderData } from "react-router-dom";
import Messages from "./pages/Messages";

const router = createBrowserRouter([
  // --- Public Acquisition Layer ---
  {
    path: "/",
    element: <Suspense fallback={<Loader />}><LandingPage /></Suspense>,
  },
  {
    path: "/search",
    element: <Suspense fallback={<Loader />}><GlobalSearch /></Suspense>,
  },
  {
    path: "/teacher/:username",
    element: <Suspense fallback={<Loader />}><TeacherProfile /></Suspense>,
  },
  
  // --- Auth Layer ---
  {
    path: "/auth/login",
    element: <Suspense fallback={<Loader />}><Login /></Suspense>,
  },
  {
    path: "/auth/register",
    element: <Suspense fallback={<Loader />}><Register /></Suspense>,
  },

  // --- Protected Workspaces ---
  {
    path: "/",
    element: <ProtectedRoute />, // Wraps all below in auth check
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          // If they hit the protected root, send them to login or their dashboard (handled in logic or we can just navigate to dashboard)
          // For now, if they somehow get here, we can redirect to their specific dashboard, but DashboardLayout handles UI.
          {
            path: "dashboard/teacher",
            element: <Suspense fallback={<Loader />}><Dashboard /></Suspense>,
            loader: dashboardLoader
          },
          {
            path: "dashboard/student",
            element: <Suspense fallback={<Loader />}><StudentDashboard /></Suspense>,
            loader: dashboardLoader
          },
          // Alias for backward compatibility or simple redirect
          {
            path: "dashboard",
            element: <Navigate to="/dashboard/student" replace /> // In a real scenario, this would dynamically check role.
          },
          {
            id: "hub-workspace",
            path: "hubs/:hubId",
            element: <Suspense fallback={<Loader />}><HubWorkspaceLayout /></Suspense>,
            loader: HubLoader,
            children: [
              { index: true, element: <Navigate to="feed" replace /> },
              { path: "feed", element: <FeedTab /> },
              { path: "chat", element: <ChatTab /> },
              { path: "schedule", element: <ScheduleTab /> },
              { 
                path: "roster", 
                element: <RosterTab />,
                loader: StudentsLoader // <-- Attached specifically to the Roster Tab!
              },
              { path: "vault", element: <VaultTab /> }
            ]
          },
          {
            path: "messages",
            element: <Messages />
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
      <SocketProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </SocketProvider>
    </AuthProvider>
  );
}