import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API_Service/apiService";
import { Search } from "lucide-react";

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    createdAt: string;
    isPublished: boolean;
}

export default function StudentCoursePage() {
    const navigate = useNavigate();

    const [courses, setCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const getAuthHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    });

    // ================= FETCH COURSES =================
    const fetchCourses = async () => {
        try {
            const res = await API.get("/super/v1/getallcourse", {
                headers: getAuthHeader(),
            });

            setCourses(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // ================= SEARCH FILTER =================
    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    //calculate the publish time
    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const createdDate = new Date(dateString);

        const diffMs = now.getTime() - createdDate.getTime();

        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (years > 0) {
            return `${years} year${years > 1 ? "s" : ""} ago`;
        }

        if (months > 0) {
            return `${months} month${months > 1 ? "s" : ""} ago`;
        }

        if (days > 0) {
            return `${days} day${days > 1 ? "s" : ""} ago`;
        }

        if (hours > 0) {
            return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        }

        if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        }

        return "just now";
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* ================= HEADER ================= */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Explore Courses
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Browse and start learning today
                    </p>
                </div>

                {/* ================= SEARCH BAR ================= */}
                <div className="relative w-full md:w-[350px]">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                </div>
            </div>

            {/* ================= COURSE LIST ================= */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {filteredCourses.map((course) => (
                    <div
                        key={course.id}
                        onClick={() =>
                            navigate(`/std-course-videos/${course.id}`)
                        }
                        className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden cursor-pointer"
                    >

                        {/* COURSE IMAGE */}
                        <img
                            src={new URL(
                                `../assets/${course.imageUrl}`,
                                import.meta.url
                            ).href}
                            alt={course.title}
                            className="w-full h-48 object-cover"
                        />

                        {/* COURSE DETAILS */}
                        <div className="p-5">

                            <h2 className="text-xl font-bold text-gray-800">
                                {course.title}
                            </h2>

                            <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                                {course.description}
                            </p>

                            {/* DURATION */}
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Published{" "}
                                    <span className="font-bold text-gray-700">
                                        {getTimeAgo(course.createdAt)}
                                    </span>
                                </span>

                                {/* <span className="text-green-600 font-semibold">
                                    ₹ {course.price}
                                </span> */}
                            </div>
                        </div>
                    </div>
                ))}

            </div>

            {/* ================= EMPTY STATE ================= */}
            {filteredCourses.length === 0 && (
                <div className="text-center mt-16">
                    <h2 className="text-xl font-semibold text-gray-700">
                        No Courses Found
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Try searching with another course name
                    </p>
                </div>
            )}
        </div>
    );
}