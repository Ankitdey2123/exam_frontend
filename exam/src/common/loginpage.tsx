import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API_Service/apiService";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
        setError("All fields are required");
        return;
    }

    try {
        const res = await API.post("http://localhost:8080/api/auth/login", {
            email,
            password,
        });

        // ✅ Store token
        sessionStorage.setItem("accessToken", res.data.accessToken);

        // ✅ Determine user type from email
        let userType = "";

        if (email.includes("@admin") || email.includes("@superadmin")) {
            userType = "admin";
        } else if (email.includes("@teacher")) {
            userType = "teacher";
        } else {
            userType = "student"; // optional fallback
        }

        // ✅ Store userType
        sessionStorage.setItem("userType", userType);

        // ✅ Navigate
        navigate("/dashboard");

    } catch (err: any) {
        setError(err.response?.data?.message || "Login failed");
    }
};

    return (
        <div
            className="flex h-screen overflow-hidden"
            style={{
                background:
                    "linear-gradient(-45deg, #007bff, #00c6ff, #2563eb, #38bdf8)",
                backgroundSize: "400% 400%",
                animation: "gradientMove 10s ease infinite",
            }}
        >
            {/* KEYFRAMES */}
            <style>
                {`
                @keyframes gradientMove {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                `}
            </style>

            {/* LEFT SIDE */}
            <div className="hidden md:flex flex-1 text-white items-center justify-center p-16">
                <div>
                    <h1 className="text-4xl mb-5 font-bold">
                        Online Examination System
                    </h1>
                    <p className="text-lg opacity-90">
                        Manage exams, students, and results easily.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-1 justify-center items-center">
                <form
                    onSubmit={handleLogin}
                    autoComplete="off"
                    className="w-[420px] px-9 py-11 rounded-2xl 
                    bg-white/20 backdrop-blur-xl shadow-2xl flex flex-col"
                >
                    <h2 className="text-center mb-6 text-black text-xl font-semibold">
                        Login
                    </h2>

                    {/* EMAIL */}
                    <div className="relative mb-5">
                        <input
                            type="email"
                            required
                            autoComplete="email"
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="peer w-full px-3 py-3 border border-gray-300 rounded-md 
                            bg-white outline-none text-sm transition-all
                            focus:border-blue-500 focus:scale-[1.02]"
                        />
                        <label
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm 
                            bg-white px-1 transition-all
                            peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-blue-500
                            peer-valid:top-[-8px] peer-valid:text-xs peer-valid:text-blue-500"
                        >
                            Email Address
                        </label>
                    </div>

                    {/* PASSWORD */}
                    <div className="relative mb-5">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="current-password"
                            placeholder=" "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="peer w-full px-3 py-3 border border-gray-300 rounded-md 
                            bg-white outline-none text-sm transition-all
                            focus:border-blue-500 focus:scale-[1.02]"
                        />
                        <label
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm 
                            bg-white px-1 transition-all
                            peer-focus:top-[-8px] peer-focus:text-xs peer-focus:text-blue-500
                            peer-valid:top-[-8px] peer-valid:text-xs peer-valid:text-blue-500"
                        >
                            Password
                        </label>

                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 text-sm cursor-pointer hover:underline"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </span>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <p className="text-red-500 text-xs text-center mb-3">
                            {error}
                        </p>
                    )}

                    {/* BUTTON */}
                    <button
                        type="submit"
                        className="w-full py-3 mt-2 rounded-md text-white font-semibold text-base
                        bg-gradient-to-br from-slate-900 to-slate-800
                        shadow-lg transition-all duration-300
                        hover:-translate-y-1 hover:scale-[1.02]
                        active:scale-95"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}