import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API_Service/apiService";
import logo from "../assets/logo.png";
import toast from "react-hot-toast";

export default function StudentLoginPage() {

    // ✅ Login State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // ✅ Create Account State
    const [username, setUsername] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // ✅ Forgot Password States
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");


    const [error, setError] = useState("");

    // ✅ Show Password
    const [showPassword, setShowPassword] = useState(false);

    // ✅ Toggle Login / Create Account
    const [isCreateAccount, setIsCreateAccount] = useState(false);

    const navigate = useNavigate();

    // ✅ Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError("All fields are required");
            return;
        }

        //not allow to login
                const isPlatformUser =
            email.endsWith("@admin.com") ||
            email.endsWith("@superadmin.com") ||
            email.endsWith("@teacher.com");

        if (isPlatformUser) {
            setError("Only Student can login");
            return;
        }

        try {
            const res = await API.post(
                "/auth/login",
                { email, password }
            );

            sessionStorage.setItem(
                "accessToken",
                res.data.accessToken
            );

            sessionStorage.setItem("userType", "student");

            navigate("/home");

        } catch (err: any) {
            setError(
                err.response?.data?.message || "Login failed"
            );
        }
    };

    // ✅ Create Student Account
    const handleCreateAccount = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setError("");

        if (
            !username ||
            !registerEmail ||
            !registerPassword ||
            !confirmPassword
        ) {
            setError("All fields are required");
            return;
        }

        // ✅ Password Match Validation
        if (registerPassword !== confirmPassword) {
            setError(
                "Password and Confirm Password must match"
            );
            return;
        }

        try {
            await API.post(
                "/student/stu/create",
                {
                    name: username,
                    email: registerEmail,
                    password: confirmPassword,
                }
            );

            // ✅ Reset Fields
            setUsername("");
            setRegisterEmail("");
            setRegisterPassword("");
            setConfirmPassword("");

            // ✅ Back To Login
            setIsCreateAccount(false);

            navigate("/stu-login");

        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Account creation failed"
            );
        }
    };

    // ✅ Forgot Password
    const handleForgotPassword = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setError("");

        if (!forgotEmail || !newPassword) {
            setError("All fields are required");
            return;
        }

        try {

            await API.put(
                "/student/stu/fpassword",
                {
                    email: forgotEmail,
                    newPassword: newPassword,
                }
            );

            setForgotEmail("");
            setNewPassword("");

            setIsForgotPassword(false);

            toast.success("Password updated successfully");

        } catch (err: any) {

            toast.error(
                err.response?.data?.message ||
                "Password reset failed"
            );
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
            <div
                className="flex flex-1 justify-center items-center"
                style={{
                    background:
                        "linear-gradient(to right, #000000, #0f172a, #1e3a8a)",
                }}
            >
                <form
                    onSubmit={
                        isForgotPassword
                            ? handleForgotPassword
                            : isCreateAccount
                                ? handleCreateAccount
                                : handleLogin
                    }
                    autoComplete="off"
                    className="w-[420px] px-10 py-12 rounded-2xl 
                    bg-white/10 backdrop-blur-2xl 
                    border border-white/20 
                    shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                    flex flex-col"
                >

                    {/* TITLE */}
                    <h2 className="text-center mb-8 text-white text-2xl font-semibold">

                        {isForgotPassword
                            ? "Forgot Password"
                            : isCreateAccount
                                ? "Create Account"
                                : "Login"}

                    </h2>

                    {/*FORGOT PASSWORD AND CREATE ACCOUNT FORM */}
                    {
                        isForgotPassword ? (

                            <>
                                {/* EMAIL */}
                                < div className="mb-5">
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={forgotEmail}
                                        onChange={(e) =>
                                            setForgotEmail(e.target.value)
                                        }
                                        className="w-full px-4 py-3 rounded-md 
                bg-white/90 text-black text-sm 
                outline-none border border-transparent
                focus:border-blue-500 transition-all"
                                    />
                                </div>

                                {/* NEW PASSWORD */}
                                <div className="relative mb-5">
                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        className="w-full px-4 py-3 rounded-md 
                bg-white/90 text-black text-sm 
                outline-none border border-transparent
                focus:border-blue-500 transition-all"
                                    />

                                    <span
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 
                text-blue-500 text-sm cursor-pointer"
                                    >
                                        {showPassword
                                            ? "Hide"
                                            : "Show"}
                                    </span>
                                </div>
                            </>

                        ) : isCreateAccount ? (
                            <>
                                {/* USERNAME */}
                                <div className="mb-5">
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        className="w-full px-4 py-3 rounded-md 
                                    bg-white/90 text-black text-sm 
                                    outline-none border border-transparent
                                    focus:border-blue-500 transition-all"
                                    />
                                </div>

                                {/* EMAIL */}
                                <div className="mb-5">
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={registerEmail}
                                        onChange={(e) =>
                                            setRegisterEmail(
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-3 rounded-md 
                                    bg-white/90 text-black text-sm 
                                    outline-none border border-transparent
                                    focus:border-blue-500 transition-all"
                                    />
                                </div>

                                {/* PASSWORD */}
                                <div className="relative mb-5">
                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Password"
                                        value={registerPassword}
                                        onChange={(e) =>
                                            setRegisterPassword(
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-3 rounded-md 
                                    bg-white/90 text-black text-sm 
                                    outline-none border border-transparent
                                    focus:border-blue-500 transition-all"
                                    />

                                    <span
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 
                                    text-blue-500 text-sm cursor-pointer"
                                    >
                                        {showPassword
                                            ? "Hide"
                                            : "Show"}
                                    </span>
                                </div>

                                {/* CONFIRM PASSWORD */}
                                <div className="relative mb-5">
                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-3 rounded-md 
                                    bg-white/90 text-black text-sm 
                                    outline-none border border-transparent
                                    focus:border-blue-500 transition-all"
                                    />

                                    <span
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 
                                    text-blue-500 text-sm cursor-pointer"
                                    >
                                        {showPassword
                                            ? "Hide"
                                            : "Show"}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* EMAIL */}
                                <div className="mb-5">
                                    <input
                                        type="email"
                                        required
                                        autoComplete="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="w-full px-4 py-3 rounded-md 
                                    bg-white/90 text-black text-sm 
                                    outline-none border border-transparent
                                    focus:border-blue-500 transition-all"
                                    />
                                </div>

                                {/* PASSWORD */}
                                <div className="relative mb-5">
                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        required
                                        autoComplete="current-password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-3 rounded-md 
                                    bg-white/90 text-black text-sm 
                                    outline-none border border-transparent
                                    focus:border-blue-500 transition-all"
                                    />

                                    <span
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 
                                    text-blue-500 text-sm cursor-pointer"
                                    >
                                        {showPassword
                                            ? "Hide"
                                            : "Show"}
                                    </span>
                                </div>

                                {/* FORGET PASSWORD */}
                                <div className="text-right mb-5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsForgotPassword(true);
                                            setIsCreateAccount(false);
                                            setError("");
                                        }}
                                        className="text-blue-400 text-sm hover:underline"
                                    >
                                        Forget Password?
                                    </button>
                                </div>
                            </>
                        )
                    }

                    {/* ERROR */}
                    {
                        error && (
                            <p className="text-red-400 text-xs text-center mb-4">
                                {error}
                            </p>
                        )
                    }

                    {/* BUTTON */}
                    <button
                        type="submit"
                        className="w-full py-3 rounded-md text-white font-semibold text-base
                        bg-gradient-to-r from-blue-700 to-blue-500
                        shadow-lg transition-all duration-300
                        hover:scale-[1.03] active:scale-95"
                    >
                        {isCreateAccount
                            ? "Create Account"
                            : "Login"}
                    </button>

                    {/* TOGGLE */}
                    <div className="text-center mt-5">

                        {isForgotPassword ? (

                            <button
                                type="button"
                                onClick={() => {
                                    setIsForgotPassword(false);
                                    setError("");
                                }}
                                className="text-blue-400 text-sm hover:underline"
                            >
                                Back To Login
                            </button>

                        ) : !isCreateAccount ? (

                            <button
                                type="button"
                                onClick={() =>
                                    setIsCreateAccount(true)
                                }
                                className="text-blue-400 text-sm hover:underline"
                            >
                                Create New Account
                            </button>

                        ) : (

                            <button
                                type="button"
                                onClick={() =>
                                    setIsCreateAccount(false)
                                }
                                className="text-blue-400 text-sm hover:underline"
                            >
                                Back To Login
                            </button>

                        )}

                    </div>

                </form >
            </div >
        </div >
    );
}