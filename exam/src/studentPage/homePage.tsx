import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API_Service/apiService";

interface Course {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    isPublished: boolean;
}

interface Exam {
    id: number;
    title: string;
    duration: number;
    alreadyAttempted?: boolean;
}

export default function HomePage() {

    const navigate = useNavigate();

    const [courses, setCourses] =
        useState<Course[]>([]);

    const [exams, setExams] =
        useState<Exam[]>([]);

    const [loadingCourses, setLoadingCourses] =
        useState(true);

    const [loadingExams, setLoadingExams] =
        useState(true);

    // ================= STUDENT NAME =================
    const [studentName, setStudentName] =
        useState("");

    // ================= TOKEN =================
    const token =
        sessionStorage.getItem("accessToken");

    const getAuthHeader = () => ({
        Authorization: `Bearer ${token}`,
    });

    // ================= GET NAME FROM TOKEN =================
    const getStudentNameFromToken = () => {

        try {

            const token =
                sessionStorage.getItem(
                    "accessToken"
                );

            if (!token) return "";

            // JWT => header.payload.signature
            const payload =
                token.split(".")[1];

            // DECODE TOKEN
            const decodedPayload =
                JSON.parse(atob(payload));

            // RETURN NAME
            return (
                decodedPayload.name ||
                decodedPayload.username ||
                ""
            );

        } catch (err) {

            console.error(
                "Token decode failed",
                err
            );

            return "";
        }
    };

    useEffect(() => {

        fetchCourses();

        fetchExams();

        // ================= SET STUDENT NAME =================
        const name =
            getStudentNameFromToken();

        setStudentName(name);

    }, []);

    // ================= FETCH COURSES =================
    const fetchCourses = async () => {

        try {

            const res = await API.get(
                "/super/v1/getallcourse",
                {
                    headers: getAuthHeader(),
                }
            );

            const filteredCourses =
                res.data.data
                    .filter(
                        (course: Course) =>
                            course.isPublished
                    )
                    .slice(0, 4);

            setCourses(filteredCourses);

        } catch (error) {

            console.error(
                "Error fetching courses",
                error
            );

        } finally {

            setLoadingCourses(false);
        }
    };

    // ================= FETCH EXAMS =================
    const fetchExams = async () => {

        try {

            const res = await API.get(
                "/student/stu/check-attempt",
                {
                    headers: getAuthHeader(),
                }
            );

            // SHOW ONLY NOT ATTEMPTED EXAMS
            const filteredExams =
                res.data.data
                    .filter(
                        (exam: Exam) =>
                            !exam.alreadyAttempted
                    )
                    .slice(0, 4);

            setExams(filteredExams);

        } catch (error) {

            console.error(
                "Error fetching exams",
                error
            );

        } finally {

            setLoadingExams(false);
        }
    };

    // ================= FORMAT DURATION =================
    const formatDuration = (
        minutes: number
    ) => {

        const hours = Math.floor(
            minutes / 60
        );

        const mins = minutes % 60;

        if (hours > 0) {

            return `${hours}h ${mins}m`;
        }

        return `${mins}m`;
    };

    return (
        <div className="p-6">

            {/* ================= WELCOME ================= */}
            <div className="mb-10">

                <h1 className="text-3xl font-bold text-slate-800">
                    Welcome {studentName} 👋
                </h1>

                <p className="text-gray-600 mt-2">
                    Continue your learning journey and
                    check your upcoming exams.
                </p>
            </div>

            {/* ================= COURSES ================= */}
            <div className="mb-10">

                <div className="flex items-center justify-between mb-5">

                    <h2 className="text-2xl font-bold text-slate-800">
                        Courses
                    </h2>

                    <button
                        onClick={() =>
                            navigate("/stu-course")
                        }
                        className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                        See All
                    </button>
                </div>

                {loadingCourses ? (

                    <div className="text-center py-10 text-lg font-semibold">
                        Loading Courses...
                    </div>

                ) : courses.length > 0 ? (

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                        {courses.map((course) => (

                            <div
                                key={course.id}
                                onClick={() =>
                                    navigate(
                                        `/std-course-videos/${course.id}`
                                    )
                                }
                                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer"
                            >

                                {/* IMAGE */}
                                <img
                                    src={new URL(
                                        `../assets/${course.imageUrl}`,
                                        import.meta.url
                                    ).href}
                                    alt={course.title}
                                    className="w-full h-48 object-cover"
                                />

                                {/* DETAILS */}
                                <div className="p-4">

                                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                                        {course.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        {
                                            course.description
                                        }
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                ) : (

                    <div className="bg-white rounded-xl shadow p-10 text-center">

                        <h3 className="text-2xl font-bold text-gray-700">
                            No Courses Available
                        </h3>

                        <p className="text-gray-500 mt-2">
                            Published courses will
                            appear here
                        </p>
                    </div>
                )}
            </div>

            {/* ================= EXAMS ================= */}
            <div>

                <div className="flex items-center justify-between mb-5">

                    <h2 className="text-2xl font-bold text-slate-800">
                        Upcoming Exams
                    </h2>

                    <button
                        onClick={() =>
                            navigate("/stu-exam")
                        }
                        className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                        See All
                    </button>
                </div>

                {loadingExams ? (

                    <div className="bg-white rounded-xl shadow p-10 text-center text-lg font-semibold">
                        Loading Exams...
                    </div>

                ) : exams.length > 0 ? (

                    <div className="bg-white rounded-xl shadow overflow-hidden">

                        <table className="w-full text-left">

                            <thead className="bg-slate-100">

                                <tr>
                                    <th className="p-4">
                                        Exam Title
                                    </th>

                                    <th className="p-4">
                                        Duration
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {exams.map(
                                    (exam) => (

                                        <tr
                                            key={exam.id}
                                            onClick={() =>
                                                navigate(
                                                    `/stu-startexam/${exam.id}`
                                                )
                                            }
                                            className="border-t hover:bg-gray-50 cursor-pointer transition"
                                        >

                                            <td className="p-4 font-medium">
                                                {
                                                    exam.title
                                                }
                                            </td>

                                            <td className="p-4">
                                                {formatDuration(
                                                    exam.duration
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                ) : (

                    <div className="bg-white rounded-xl shadow p-10 text-center">

                        <h3 className="text-2xl font-bold text-gray-700">
                            No Upcoming Exams
                        </h3>

                        <p className="text-gray-500 mt-2">
                            Exams will appear here
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}