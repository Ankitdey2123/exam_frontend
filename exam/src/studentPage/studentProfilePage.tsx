import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API_Service/apiService";
import {
    User,
    Mail,
    ShieldCheck,
    BookOpen,
    Award,
    Lock,
    X,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    Search,
} from "lucide-react";
import toast from "react-hot-toast";

interface StudentProfile {
    id: number;
    name: string;
    email: string;
    status: boolean;
}

interface AttemptedExam {
    id: number;
    title: string;
    totalMarks: number;
    duration: number;
    alreadyAttempted: boolean;
}

export default function StudentProfilePage() {

    const navigate = useNavigate();

    const [profile, setProfile] =
        useState<StudentProfile | null>(null);

    const [attemptedExams, setAttemptedExams] =
        useState<AttemptedExam[]>([]);

    const [loading, setLoading] =
        useState(true);

    // ================= MODAL =================
    const [showModal, setShowModal] =
        useState(false);

    const [oldPassword, setOldPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    // ================= SHOW / HIDE PASSWORD =================
    const [showOldPassword, setShowOldPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    // ================= PARTICIPATED EXAM SECTION =================
    const [showParticipatedExams, setShowParticipatedExams] =
        useState(false);

    const [searchTerm, setSearchTerm] =
        useState("");

    const getAuthHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem(
            "accessToken"
        )}`,
    });

    // ================= FETCH PROFILE =================
    const fetchProfile = async () => {

        try {

            const profileRes = await API.get(
                "/student/stu/profile",
                {
                    headers: getAuthHeader(),
                }
            );

            setProfile(profileRes.data.data);

            const examRes = await API.get(
                "/student/stu/check-attempt",
                {
                    headers: getAuthHeader(),
                }
            );

            const attemptedOnly =
                examRes.data.data.filter(
                    (exam: AttemptedExam) =>
                        exam.alreadyAttempted
                );

            setAttemptedExams(attemptedOnly);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchProfile();

    }, []);

    // ================= CHANGE PASSWORD =================
    const handleChangePassword = async () => {

        if (!oldPassword || !newPassword) {

            return toast.error(
                "Please fill all fields"
            );
        }

        try {

            setIsSubmitting(true);

            const res = await API.put(
                "/student/stu/changepassword",
                {
                    oldPassword,
                    newPassword,
                },
                {
                    headers: getAuthHeader(),
                }
            );

            toast.success(
                res.data.message ||
                "Password changed successfully"
            );

            setShowModal(false);

            setOldPassword("");

            setNewPassword("");

        } catch (err: any) {

            console.error(err);

            toast.error(
                err?.response?.data?.message ||
                "Failed to change password"
            );

        } finally {

            setIsSubmitting(false);
        }
    };

    // ================= SEARCH FILTER =================
    const filteredExams =
        attemptedExams.filter((exam) =>
            exam.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );

    // ================= LOADING =================
    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
                Loading Profile...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-5xl mx-auto">

                {/* ================= PROFILE CARD ================= */}
                <div className="bg-white rounded-3xl shadow-xl p-8">

                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">

                        <div className="flex items-center gap-5">

                            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                                <User
                                    size={45}
                                    className="text-blue-600"
                                />
                            </div>

                            <div>

                                <h1 className="text-4xl font-bold text-gray-800">
                                    {profile?.name}
                                </h1>

                                <p className="text-gray-500 mt-2 flex items-center gap-2">
                                    <Mail size={18} />

                                    {profile?.email}
                                </p>

                                <div className="mt-4">

                                    {profile?.status ? (

                                        <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2 w-fit">
                                            <ShieldCheck size={16} />

                                            Active
                                        </span>

                                    ) : (

                                        <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-semibold">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* CHANGE PASSWORD BUTTON */}
                        <button
                            onClick={() =>
                                setShowModal(true)
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
                        >
                            <Lock size={18} />

                            Change Password
                        </button>
                    </div>
                </div>

                {/* ================= PARTICIPATED EXAMS SECTION ================= */}
                <div className="mt-10 bg-white rounded-3xl shadow-xl p-6">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <button
                            onClick={() =>
                                setShowParticipatedExams(
                                    !showParticipatedExams
                                )
                            }
                            className="flex items-center gap-3"
                        >

                            <Award className="text-blue-600" />

                            <h2 className="text-3xl font-bold text-gray-800">
                                Participated Exams
                            </h2>

                            {showParticipatedExams ? (
                                <ChevronUp className="text-gray-600" />
                            ) : (
                                <ChevronDown className="text-gray-600" />
                            )}
                        </button>

                        {/* SEARCH BAR */}
                        {showParticipatedExams && (
                            <div className="relative w-full md:w-80">

                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    placeholder="Search exam..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* CONTENT */}
                    {showParticipatedExams && (

                        <div className="mt-8">

                            {filteredExams.length > 0 ? (

                                <div className="grid md:grid-cols-2 gap-6">

                                    {filteredExams.map(
                                        (exam) => (

                                            <div
                                                key={exam.id}
                                                className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                                            >

                                                <div>

                                                    <h3 className="text-2xl font-bold text-gray-800">
                                                        {exam.title}
                                                    </h3>

                                                    <div className="mt-4 space-y-2">

                                                        <p className="text-gray-600 flex items-center gap-2">
                                                            <BookOpen
                                                                size={18}
                                                                className="text-blue-600"
                                                            />

                                                            Duration:

                                                            <span className="font-semibold">
                                                                {
                                                                    exam.duration
                                                                }{" "}
                                                                mins
                                                            </span>
                                                        </p>

                                                        <p className="text-gray-600 flex items-center gap-2">
                                                            <Award
                                                                size={18}
                                                                className="text-green-600"
                                                            />

                                                            Total Marks:

                                                            <span className="font-semibold">
                                                                {
                                                                    exam.totalMarks
                                                                }
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/stu-result/${exam.id}`
                                                        )
                                                    }
                                                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
                                                >
                                                    View Result
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>

                            ) : (

                                <div className="text-center py-10">

                                    <h3 className="text-2xl font-bold text-gray-700">
                                        No Exams Found
                                    </h3>

                                    <p className="text-gray-500 mt-2">
                                        Try searching with another title
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ================= CHANGE PASSWORD MODAL ================= */}
            {showModal && (

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-2xl">

                        {/* CLOSE */}
                        <button
                            onClick={() =>
                                setShowModal(false)
                            }
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                        >
                            <X size={22} />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Change Password
                        </h2>

                        {/* OLD PASSWORD */}
                        <div className="mb-4">

                            <label className="block text-gray-700 font-medium mb-2">
                                Old Password
                            </label>

                            <div className="relative">

                                <input
                                    type={
                                        showOldPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={oldPassword}
                                    onChange={(e) =>
                                        setOldPassword(
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter old password"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowOldPassword(
                                            !showOldPassword
                                        )
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                                >
                                    {showOldPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* NEW PASSWORD */}
                        <div>

                            <label className="block text-gray-700 font-medium mb-2">
                                New Password
                            </label>

                            <div className="relative">

                                <input
                                    type={
                                        showNewPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter new password"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNewPassword(
                                            !showNewPassword
                                        )
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                                >
                                    {showNewPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* BUTTON */}
                        <button
                            onClick={
                                handleChangePassword
                            }
                            disabled={isSubmitting}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
                        >
                            {isSubmitting
                                ? "Updating..."
                                : "Submit"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}