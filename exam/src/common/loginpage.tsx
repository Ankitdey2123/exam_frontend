import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API_Service/apiService";
import logo from "../assets/logo.png";

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

        // ✅ ALLOW ONLY PLATFORM USERS
        const isPlatformUser =
            email.endsWith("@admin.com") ||
            email.endsWith("@superadmin.com") ||
            email.endsWith("@teacher.com");

        if (!isPlatformUser) {
            setError("Only Admin and Platform users can login");
            return;
        }

        try {
            const res = await API.post(
                "http://localhost:8080/api/auth/login",
                { email, password }
            );

            sessionStorage.setItem("accessToken", res.data.accessToken);

            let userType = "";
            if (email.includes("@admin") || email.includes("@superadmin")) {
                userType = "admin";
            } else if (email.includes("@teacher")) {
                userType = "teacher";
            } else {
                userType = "student";
            }

            sessionStorage.setItem("userType", userType);
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
                    "linear-gradient(-45deg, #020617, #0f172a, #1e3a8a, #0ea5e9)",
                backgroundSize: "400% 400%",
                animation: "gradientMove 12s ease infinite",
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
            <div className="hidden md:flex flex-1 relative items-center justify-center">
                <img
                    src={logo}
                    alt="CodeMechanica"
                    className="absolute inset-0 w-full h-full object-cover opacity-20s"
                />

            </div>

            {/* RIGHT SIDE */}
            {/* RIGHT SIDE */}
            <div
                className="flex flex-1 justify-center items-center"
                style={{
                    background: "linear-gradient(to right, #000000, #0f172a, #1e3a8a)",
                }}
            >
                <form
                    onSubmit={handleLogin}
                    autoComplete="off"
                    className="w-[420px] px-10 py-12 rounded-2xl 
        bg-white/10 backdrop-blur-2xl 
        border border-white/20 
        shadow-[0_20px_60px_rgba(0,0,0,0.5)]
        flex flex-col"
                >
                    <h2 className="text-center mb-8 text-white text-2xl font-semibold">
                        Login
                    </h2>

                    {/* EMAIL */}
                    <div className="mb-5">
                        <input
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-md 
                bg-white/90 text-black text-sm 
                outline-none border border-transparent
                focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* PASSWORD */}
                    <div className="relative mb-5">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="current-password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-md 
                bg-white/90 text-black text-sm 
                outline-none border border-transparent
                focus:border-blue-500 transition-all"
                        />

                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 
                text-blue-500 text-sm cursor-pointer"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </span>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <p className="text-red-400 text-xs text-center mb-4">
                            {error}
                        </p>
                    )}

                    {/* BUTTON */}
                    <button
                        type="submit"
                        className="w-full py-3 rounded-md text-white font-semibold text-base
            bg-gradient-to-r from-blue-700 to-blue-500
            shadow-lg transition-all duration-300
            hover:scale-[1.03] active:scale-95"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}