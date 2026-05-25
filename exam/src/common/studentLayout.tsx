import StudentSidebar from "./studentSideBar";
import { Outlet } from "react-router-dom";

export default function StudentLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}