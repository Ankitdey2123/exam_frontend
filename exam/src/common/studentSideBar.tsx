import {
    FileText,
    LogOut,
    LibraryBig,
    Home,
    UserCog,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import banner from "../assets/banner.png";

export default function StudentSidebar() {
    const navigate = useNavigate();
    const location = useLocation();


    // ✅ All menu items
    const allMenuItems = [
        { id: "home", name: "Home", icon: Home },
        {id: "stu-course",name:"Course",icon:LibraryBig},
        {id:"stu-exam",name:"Exam",icon:FileText},
        {id:"stu-profile",name:"Profile",icon:UserCog}

    ];

    const handleLogout = () => {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("userType"); // ✅ also clear role
        navigate("/");
    };

    return (
        <div className="w-64 h-screen bg-slate-900 text-white flex flex-col justify-between">

            {/* TOP */}
            <div>
                <div className="border-b border-slate-700">
                    <div className="w-full h-[140px] overflow-hidden bg-slate-950 flex items-center justify-center">
                        <img
                            src={banner}
                            alt="CodeMechanica"
                            className="w-full h-full object-cover scale-125"
                        />
                    </div>
                </div>

                {/* MENU */}
                <div className="mt-4">
                    {allMenuItems.map((item) => {
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