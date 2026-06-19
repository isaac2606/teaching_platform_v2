import { useContext } from "react";
import { Navigate, Outlet,useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    // If still checking localStorage, show a simple loader
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg-base">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    // If there is no user, instantly kick them to the login page!
    if (!user) {
        return <Navigate to="/login" state={{from:location.pathname}} replace />;
    }

    // If they passed children (like <JoinGroup />), render the children.
    // Otherwise, fallback to rendering nested <Outlet /> routes.
    return children ? children : <Outlet />;
}
