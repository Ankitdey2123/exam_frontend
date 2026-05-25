import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../API_Service/apiService";
import {
    ArrowLeft,
    Clock3,
    Award,
    CalendarDays,
    PlayCircle,
} from "lucide-react";

interface Exam {
    id: number;
    title: string;
    duration: number;
    totalMarks: number;
    isPublished: boolean;
    isDeleted: boolean;
    createdAt: string;
    startTime: string;
    courseId: number | null;
}

export default function StudentStartExamPage() {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);

    const getAuthHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    });

    // ================= FETCH EXAM =================
    const fetchExam = async () => {
        try {
            const res = await API.get(
                `/teacher/tec/exam/${examId}`,
                {
                    headers: getAuthHeader(),
                }
            );

            setExam(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (examId) {
            fetchExam();
        }
    }, [examId]);

    // ================= DURATION =================
    const formatDuration = (minutes: number) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hrs > 0 && mins > 0) {
            return `${hrs}h ${mins}m`;
        }

        if (hrs > 0) {
            return `${hrs} hour${hrs > 1 ? "s" : ""}`;
        }

        return `${mins} min`;
    };

    // ================= START TIME =================
    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
                Loading Exam...
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-red-600">
                Exam Not Found
            </div>
        );
    }

    // ================= START STATUS =================
const getExamStartStatus = (
    startTime: string
) => {

    const now = new Date();

    const start =
        new Date(startTime);

    // ✅ EXAM STARTED
    // Student can give exam ANYTIME
    // after start date/time
    if (now >= start) {

        return {
            started: true,
            text: "Start Exam",
        };
    }

    const diffMs =
        start.getTime() -
        now.getTime();

    const minutes = Math.floor(
        diffMs / (1000 * 60)
    );

    const hours = Math.floor(
        diffMs / (1000 * 60 * 60)
    );

    const days = Math.floor(
        diffMs /
        (1000 * 60 * 60 * 24)
    );

    const months = Math.floor(
        days / 30
    );

    if (months > 0) {

        return {
            started: false,
            text: `Exam starts in ${months} month${months > 1 ? "s" : ""
                }`,
        };
    }

    if (days > 0) {

        return {
            started: false,
            text: `Exam starts in ${days} day${days > 1 ? "s" : ""
                }`,
        };
    }

    if (hours > 0) {

        return {
            started: false,
            text: `Exam starts in ${hours} hour${hours > 1 ? "s" : ""
                }`,
        };
    }

    return {
        started: false,
        text: `Exam starts in ${minutes} minute${minutes > 1 ? "s" : ""
            }`,
    };
};

    const examStatus =
        getExamStartStatus(
            exam.startTime
        );

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* ================= BACK ================= */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 mb-6"
            >
                <ArrowLeft size={24} />
                <span className="font-medium">
                    Back
                </span>
            </button>

            {/* ================= MAIN CARD ================= */}
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">

                {/* HEADER */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
                    <h1 className="text-4xl font-bold">
                        {exam.title}
                    </h1>

                    <p className="mt-2 text-blue-100">
                        Please read all exam details carefully before starting
                    </p>
                </div>

                {/* BODY */}
                <div className="p-8">

                    {/* DETAILS */}
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* DURATION */}
                        <div className="bg-gray-50 rounded-2xl p-5 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <Clock3 className="text-blue-600" />
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">
                                    Duration
                                </p>

                                <h3 className="text-xl font-bold text-gray-800">
                                    {formatDuration(exam.duration)}
                                </h3>
                            </div>
                        </div>

                        {/* TOTAL MARKS */}
                        <div className="bg-gray-50 rounded-2xl p-5 flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-xl">
                                <Award className="text-green-600" />
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">
                                    Total Marks
                                </p>

                                <h3 className="text-xl font-bold text-gray-800">
                                    {exam.totalMarks}
                                </h3>
                            </div>
                        </div>

                        {/* START TIME */}
                        <div className="bg-gray-50 rounded-2xl p-5 flex items-center gap-4 md:col-span-2">
                            <div className="bg-orange-100 p-3 rounded-xl">
                                <CalendarDays className="text-orange-600" />
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm">
                                    Exam Start Time
                                </p>

                                <h3 className="text-lg font-bold text-gray-800">
                                    {formatDateTime(exam.startTime)}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* INSTRUCTIONS */}
                    <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-blue-700 mb-4">
                            Instructions
                        </h2>

                        <ul className="space-y-3 text-gray-700">
                            <li>
                                • Make sure you have a stable internet connection.
                            </li>

                            <li>
                                • Do not refresh or close the browser during the exam.
                            </li>

                            <li>
                                • The timer will start immediately after clicking Start Exam.
                            </li>

                            <li>
                                • Submit your answers before the exam duration ends.
                            </li>
                        </ul>
                    </div>

                    {/* BUTTON */}
                    <button
                        disabled={!examStatus.started}
                        onClick={() =>
                            navigate(
                                `/stu-live-exam/${exam.id}`
                            )
                        }
                        className={`w-full mt-8 py-4 rounded-2xl text-lg font-semibold flex items-center justify-center gap-3 transition ${examStatus.started
                            ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        <PlayCircle size={24} />

                        {examStatus.text}
                    </button>
                </div>
            </div>
        </div>
    );
}