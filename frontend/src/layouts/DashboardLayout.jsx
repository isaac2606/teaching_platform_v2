import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex w-full min-h-screen bg-neutral-800">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
