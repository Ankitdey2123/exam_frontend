import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API_Service/apiService";
import {
    Clock3,
    Award,
    CalendarDays,
    Search,
} from "lucide-react";

interface Exam {
    id: number;
    title: string;
    duration: number;
    totalMarks: number;
    isDeleted: boolean;
    isPublished: boolean;
    createdAt: string;
    startTime: string;
    courseId: number | null;

    alreadyAttempted?: boolean;
}

interface AttemptExam {
    id: number;
    alreadyAttempted: boolean;
}

export default function StudentExamPage() {

    const navigate = useNavigate();

    const [exams, setExams] =
        useState<Exam[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [searchTerm, setSearchTerm] =
        useState("");

    const getAuthHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem(
            "accessToken"
        )}`,
    });

    // ================= FETCH EXAMS =================
    const fetchExams = async () => {

        try {

            // ================= GET ALL EXAMS =================
            const examRes = await API.get(
                "/teacher/tec/getallexam",
                {
                    headers: getAuthHeader(),
                }
            );

            // ================= GET ATTEMPT STATUS =================
            const attemptRes = await API.get(
                "/student/stu/check-attempt",
                {
                    headers: getAuthHeader(),
                }
            );

            const examsData =
                examRes.data.data;

            const attemptData =
                attemptRes.data.data;

            // ================= FILTER EXAMS =================
            // ONLY:
            // ✅ isPublished = true
            // ✅ isDeleted = false
            const filteredExams =
                examsData.filter(
                    (exam: Exam) =>
                        exam.isPublished &&
                        !exam.isDeleted
                );

            // ================= MERGE ATTEMPT STATUS =================
            const examsWithAttemptStatus =
                filteredExams.map(
                    (exam: Exam) => {

                        const attemptExam =
                            attemptData.find(
                                (
                                    item: AttemptExam
                                ) =>
                                    item.id ===
                                    exam.id
                            );

                        return {
                            ...exam,

                            alreadyAttempted:
                                attemptExam?.alreadyAttempted ||
                                false,
                        };
                    }
                );

            setExams(
                examsWithAttemptStatus
            );

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchExams();

    }, []);

    // ================= SEARCH FILTER =================
    const filteredExams = exams.filter(
        (exam) =>
            exam.title
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )
    );

    // ================= PUBLISHED TIME =================
    const getTimeAgo = (
        dateString: string
    ) => {

        const now = new Date();

        const createdDate =
            new Date(dateString);

        const diffMs =
            now.getTime() -
            createdDate.getTime();

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

        const years = Math.floor(
            days / 365
        );

        if (years > 0) {

            return `${years} year${years > 1 ? "s" : ""
                } ago`;
        }

        if (months > 0) {

            return `${months} month${months > 1 ? "s" : ""
                } ago`;
        }

        if (days > 0) {

            return `${days} day${days > 1 ? "s" : ""
                } ago`;
        }

        if (hours > 0) {

            return `${hours} hour${hours > 1 ? "s" : ""
                } ago`;
        }

        if (minutes > 0) {

            return `${minutes} minute${minutes > 1 ? "s" : ""
                } ago`;
        }

        return "just now";
    };

    // ================= START TIME =================
    const getStartTimeText = (
        startTime: string
    ) => {

        const now = new Date();

        const start =
            new Date(startTime);

        const diffMs =
            start.getTime() -
            now.getTime();

        if (diffMs <= 0) {

            return "Started";
        }

        const minutes = Math.floor(
            diffMs / (1000 * 60)
        );

        const hours = Math.floor(
            diffMs /
            (1000 * 60 * 60)
        );

        const days = Math.floor(
            diffMs /
            (1000 * 60 * 60 * 24)
        );

        const months = Math.floor(
            days / 30
        );

        if (months > 0) {

            return `Starts in ${months} month${months > 1 ? "s" : ""
                }`;
        }

        if (days > 0) {

            return `Starts in ${days} day${days > 1 ? "s" : ""
                }`;
        }

        if (hours > 0) {

            return `Starts in ${hours} hour${hours > 1 ? "s" : ""
                }`;
        }

        return `Starts in ${minutes} minute${minutes > 1 ? "s" : ""
            }`;
    };

    // ================= DURATION =================
    const formatDuration = (
        minutes: number
    ) => {

        const hrs = Math.floor(
            minutes / 60
        );

        const mins = minutes % 60;

        if (hrs > 0 && mins > 0) {

            return `${hrs}h ${mins}m`;
        }

        if (hrs > 0) {

            return `${hrs} hour${hrs > 1 ? "s" : ""
                }`;
        }

        return `${mins} min`;
    };

    // ================= LOADING UI =================
    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
                Loading Exams...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* ================= HEADER ================= */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Student Exams
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Attend your upcoming exams
                    </p>
                </div>

                {/* ================= SEARCH ================= */}
                <div className="relative w-full md:w-[320px]">

                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Search exam by title..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                </div>
            </div>

            {/* ================= EXAM LIST ================= */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {filteredExams.map((exam) => (

                    <div
                        key={exam.id}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >

                        {/* TITLE */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {exam.title}
                            </h2>
                        </div>

                        {/* PUBLISHED */}
                        <p className="text-sm text-gray-500 mt-2">

                            Published{" "}

                            <span className="font-bold text-gray-700">
                                {getTimeAgo(
                                    exam.createdAt
                                )}
                            </span>
                        </p>

                        {/* DETAILS */}
                        <div className="mt-5 space-y-3">

                            {/* DURATION */}
                            <div className="flex items-center gap-3">

                                <Clock3
                                    size={18}
                                    className="text-blue-600"
                                />

                                <span className="text-gray-700">

                                    Duration:{" "}

                                    <span className="font-semibold">
                                        {formatDuration(
                                            exam.duration
                                        )}
                                    </span>
                                </span>
                            </div>

                            {/* TOTAL MARKS */}
                            <div className="flex items-center gap-3">

                                <Award
                                    size={18}
                                    className="text-green-600"
                                />

                                <span className="text-gray-700">

                                    Total Marks:{" "}

                                    <span className="font-semibold">
                                        {
                                            exam.totalMarks
                                        }
                                    </span>
                                </span>
                            </div>

                            {/* START TIME */}
                            <div className="flex items-center gap-3">

                                <CalendarDays
                                    size={18}
                                    className="text-orange-600"
                                />

                                <span className="text-gray-700 font-semibold">
                                    {getStartTimeText(
                                        exam.startTime
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* ================= BUTTON ================= */}
                        <button
                            disabled={
                                !exam.alreadyAttempted &&
                                new Date() < new Date(exam.startTime)
                            }
                            onClick={() => {

                                if (exam.alreadyAttempted) {

                                    navigate(
                                        `/stu-result/${exam.id}`
                                    );

                                } else {

                                    navigate(
                                        `/stu-startexam/${exam.id}`
                                    );
                                }
                            }}
                            className={`w-full mt-6 py-3 rounded-xl font-semibold transition ${(!exam.alreadyAttempted &&
                                    new Date() < new Date(exam.startTime))
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : exam.alreadyAttempted
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                        >

                            {exam.alreadyAttempted
                                ? "View Result"
                                : new Date() < new Date(exam.startTime)
                                    ? "Not Started Yet"
                                    : "Proceed"}

                        </button>
                    </div>
                ))}
            </div>

            {/* ================= EMPTY ================= */}
            {!loading &&
                filteredExams.length === 0 && (

                    <div className="text-center mt-16">

                        <h2 className="text-2xl font-semibold text-gray-700">
                            No Exams Available
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Exams will appear here once published
                        </p>
                    </div>
                )}
        </div>
    );
}