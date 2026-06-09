import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import './App.css';
import TeacherFeed from "../hub/TeacherFeed";
import {GroupProvider} from "./context/GroupContext"
import { useContext } from "react";
// Lazy loading pages for performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TeacherHub = lazy(() => import("../hub/TeacherHub")); // Note: This will need to be ported to V2 pages later
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

// Fallback loader component
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen text-white bg-bg-base">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
  </div>
);
const INITIAL_HUBS = [
    { id: "1", title: "math", status: "not done", messages:["hello","hi","test"] },
    { id: "2", title: "svt", status: "done" ,messages:["hello","hi","test"]},
    { id: "3", title: "eco", status: "not done" ,messages:["hello","hi","test"]}
];


export default function App() {
  return (
    <AuthProvider>
      <GroupProvider value={INITIAL_HUBS}>
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
                <Route path="dashboard" element={<TeacherHub />} />
                <Route path="teacherFeed/:id" element={<TeacherFeed />} />
                {/* Future pages can be added here */}
                {/* <Route path="groups" element={<Groups />} /> */}
                {/* <Route path="schedule" element={<Schedule />} /> */}
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </GroupProvider>
    </AuthProvider>
  );
}