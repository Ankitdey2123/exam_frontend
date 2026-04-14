import {
    LayoutDashboard,
    ShieldCheck,
    Users,
    Building2,
    FileText,
    LogOut,
    Key,
    LucideSchool2,
    CircleQuestionMark,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ Get user type
    const userType = sessionStorage.getItem("userType");

    // ✅ All menu items
    const allMenuItems = [
        { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
        { id: "permission", name: "Permission", icon: Key },
        { id: "role", name: "Role", icon: ShieldCheck },
        { id: "platform-user", name: "Platform User", icon: Users },
        { id: "tenant-user", name: "Tenant User", icon: Building2 },
        { id: "exam", name: "Exam", icon: FileText },
        { id: "center", name: "Centers", icon: LucideSchool2 },
        { id: "question", name: "Question", icon: CircleQuestionMark },
    ];

    // ✅ Filter menu based on role
    const menuItems =
        userType === "admin"
            ? allMenuItems
            : allMenuItems.filter((item) =>
                ["dashboard", "exam", "question"].includes(item.id)
            );

    const handleLogout = () => {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("userType"); // ✅ also clear role
        navigate("/");
    };

    return (
        <div className="w-64 h-screen bg-slate-900 text-white flex flex-col justify-between">

            {/* TOP */}
            <div>
                <div className="text-xl font-bold p-6 border-b border-slate-700">
                    Exam System
                </div>

                {/* MENU */}
                <div className="mt-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === `/${item.id}`;

                        return (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/${item.id}`)}
                                className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition
                                ${isActive ? "bg-slate-700" : "hover:bg-slate-800"}`}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* LOGOUT */}
            <div
                onClick={handleLogout}
                className="flex items-center gap-3 px-6 py-4 cursor-pointer border-t border-slate-700 hover:bg-red-600"
            >
                <LogOut size={20} />
                Logout
            </div>
        </div>
    );
}