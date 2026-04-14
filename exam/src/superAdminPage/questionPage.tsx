import { useEffect, useState } from "react";
import API from "../API_Service/apiService";
import { useNavigate } from "react-router-dom";
import { Eye, FilePlus } from "lucide-react";
import toast from "react-hot-toast";

interface Exam {
    id: number;
    title: string;
    duration: number;
    startTime: string;
    isDeleted: boolean;
}

export default function QuestionPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const navigate = useNavigate();

    const token = sessionStorage.getItem("accessToken");

    // ================= FETCH =================
    const fetchExams = async () => {
        try {
            const res = await API.get("/teacher/tec/getallexam", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setExams(res.data.data);
        } catch {
            toast.error("Failed to fetch exams");
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    // ================= FORMAT =================
    const formatDuration = (min: number) => {
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${h}h ${m}m`;
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Question Page</h1>

            <div className="bg-white shadow rounded">
                <table className="w-full text-center">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">Exam Name</th>
                            <th>Duration</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {exams.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-4">
                                    No Exams Found
                                </td>
                            </tr>
                        ) : (
                            exams.map((exam) => (
                                <tr key={exam.id} className="border-t">
                                    <td className="p-3">{exam.title}</td>
                                    <td>{formatDuration(exam.duration)}</td>
                                    <td>{formatDate(exam.startTime)}</td>

                                    {/* STATUS */}
                                    <td>
                                        {exam.isDeleted ? (
                                            <span className="text-red-600 font-semibold">
                                                Expired
                                            </span>
                                        ) : (
                                            <span className="text-green-600 font-semibold">
                                                Active
                                            </span>
                                        )}
                                    </td>

                                    {/* ACTION */}
                                    <td className="flex justify-center gap-3 p-2">
                                        {/* SET QUESTION (DISABLED IF EXPIRED) */}
                                        <button
                                            onClick={() => {
                                                if (!exam.isDeleted) {
                                                    navigate(`/set-question/${exam.id}`);
                                                }
                                            }}
                                            disabled={exam.isDeleted}
                                            className={`p-2 rounded ${exam.isDeleted
                                                    ? "bg-gray-200 cursor-not-allowed opacity-50"
                                                    : "hover:bg-blue-100"
                                                }`}
                                            title={
                                                exam.isDeleted
                                                    ? "Exam expired"
                                                    : "Set Question"
                                            }
                                        >
                                            <FilePlus
                                                className={
                                                    exam.isDeleted
                                                        ? "text-gray-400"
                                                        : "text-blue-600"
                                                }
                                                size={18}
                                            />
                                        </button>

                                        {/* VIEW QUESTION */}
                                        <button
                                            onClick={() =>
                                                navigate(`/view-question/${exam.id}`)
                                            }
                                            className="p-2 hover:bg-green-100 rounded"
                                            title="View Question"
                                        >
                                            <Eye
                                                className="text-green-600"
                                                size={18}
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}