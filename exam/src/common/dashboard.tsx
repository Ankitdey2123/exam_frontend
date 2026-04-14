import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../API_Service/apiService";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";

interface Exam {
    id: number;
    title: string;
    totalMarks: number;
    isPublished: boolean;
    isDeleted: boolean;
    startTime: string;
    createdAt?: string;
}

export default function SimpleDashboard() {
    const navigate = useNavigate();

    const [totalExams, setTotalExams] = useState(0);
    const [exams, setExams] = useState<Exam[]>([]);
    const [totalRoles, setTotalRoles] = useState(0);
    const [totalCenters, setTotalCenters] = useState(0);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        navigate("/");
    };

    // ================= FETCH =================
    const fetchData = async () => {
        try {
            const token = sessionStorage.getItem("accessToken");

            const examRes = await API.get(
                "http://localhost:8080/api/teacher/tec/getallexam",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTotalExams(examRes.data.data.length);
            setExams(examRes.data.data);

            const roleRes = await API.get(
                "http://localhost:8080/api/super/v1/getallrole",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTotalRoles(roleRes.data.data.length);

            const centerRes = await API.get(
                "http://localhost:8080/api/super/v1/getallexamcenter",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTotalCenters(centerRes.data.data.length);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();

        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const stats = [
        { title: "Total Users", value: 120 },
        { title: "Total Exams", value: totalExams },
        { title: "Centers", value: totalCenters },
        { title: "Active Roles", value: totalRoles },
    ];

    // ================= GRAPH DATA =================
    const chartData = [
        { name: "Total", value: exams.length },
        { name: "Active", value: exams.filter(e => !e.isDeleted).length },
        { name: "Published", value: exams.filter(e => e.isPublished).length },
        { name: "Deleted", value: exams.filter(e => e.isDeleted).length },
    ];

    const systemData = [
        { name: "Exams", value: totalExams },
        { name: "Roles", value: totalRoles },
        { name: "Centers", value: totalCenters },
    ];

    const groupedByDate: { [key: string]: number } = {};
    exams.forEach((e) => {
        const date = new Date(e.createdAt || e.startTime).toLocaleDateString();
        groupedByDate[date] = (groupedByDate[date] || 0) + 1;
    });

    const growthData = Object.keys(groupedByDate).map((date) => ({
        date,
        count: groupedByDate[date],
    }));

    // ================= HELPERS =================
    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString();

    const formatStatus = (exam: Exam) => {
        if (exam.isDeleted) return "Deleted";
        if (exam.isPublished) return "Published";
        return "Pending";
    };

    return (
        <div className="w-full">

            {/* HEADER (LOGOUT REMOVED) */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
                    >
                        <h3 className="text-gray-600 text-sm mb-2">{stat.title}</h3>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* ===== GRAPHS (3 IN ONE ROW) ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                {/* Overall Performance */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">
                        Overall Performance
                    </h2>

                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line dataKey="value" stroke="#2563eb" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* System Overview */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">
                        System Overview
                    </h2>

                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={systemData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#22c55e" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Growth Graph */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">
                        Exam Growth
                    </h2>

                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={growthData}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line dataKey="count" stroke="#f59e0b" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    Recent Exams
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left text-sm text-gray-600">
                                <th className="p-3">Exam Name</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Center</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {exams.slice(0, 5).map((exam) => (
                                <tr key={exam.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="p-3">{exam.title}</td>
                                    <td className="p-3">{formatDate(exam.startTime)}</td>
                                    <td className="p-3">--</td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium
                                            ${exam.isDeleted
                                                    ? "bg-red-100 text-red-700"
                                                    : exam.isPublished
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {formatStatus(exam)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}