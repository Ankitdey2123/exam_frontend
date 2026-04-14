import { useEffect, useState } from "react";
import API from "../API_Service/apiService";
import toast from "react-hot-toast";
import { Trash2, Upload, Edit2 } from "lucide-react";

interface Exam {
    id: number;
    title: string;
    duration: number;
    totalMarks: number;
    isPublished: boolean;
    isDeleted: boolean;
    startTime: string;
}

export default function ExamPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [showModal, setShowModal] = useState(false);

    // ✅ EDIT STATES (ADDED)
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [editData, setEditData] = useState({
        date: "",
        timeSlot: "",
    });

    const [formData, setFormData] = useState({
        title: "",
        duration: "",
        totalMarks: "",
        date: "",
        timeSlot: "",
    });

    const token = sessionStorage.getItem("accessToken");

    // ✅ ADD THIS LINE
    const userType = sessionStorage.getItem("userType");

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

    const formatTime = (date: string) =>
        new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString();

    // ================= HANDLE CHANGE =================
    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ================= CREATE =================
    const handleCreate = async () => {
        try {
            if (
                !formData.title ||
                !formData.duration ||
                !formData.totalMarks ||
                !formData.date ||
                !formData.timeSlot
            ) {
                return toast.error("All fields required");
            }

            const [startTime, endTime] = formData.timeSlot.split("-");

            await API.post(
                "/teacher/tec/createexam",
                {
                    title: formData.title,
                    duration: Number(formData.duration),
                    totalMarks: Number(formData.totalMarks),
                    date: formData.date,
                    startTime,
                    endTime,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Exam created successfully");

            setShowModal(false);
            setFormData({
                title: "",
                duration: "",
                totalMarks: "",
                date: "",
                timeSlot: "",
            });

            fetchExams();
        } catch (error) {
            console.error(error);
            toast.error("Error creating exam");
        }
    };

    // ================= DELETE =================
    const handleDelete = (id: number) => {
        if (userType === "teacher") return; // ✅ ADDED

        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <span>Delete this exam?</span>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-2 py-1 bg-gray-300 rounded"
                        >
                            No
                        </button>

                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                try {
                                    await API.put(
                                        `/teacher/tec/deleteexam/${id}`,
                                        {},
                                        {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        }
                                    );

                                    toast.success("Deleted successfully");
                                    fetchExams();
                                } catch (error) {
                                    toast.error("Delete failed");
                                }
                            }}
                            className="px-2 py-1 bg-red-600 text-white rounded"
                        >
                            Yes
                        </button>
                    </div>
                </div>
            ),
            { duration: Infinity }
        );
    };

    // ================= PUBLISH =================
    const handlePublish = async (id: number) => {
        if (userType === "teacher") return; // ✅ ADDED

        try {
            await API.put(
                `/teacher/tec/publishexam/${id}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success("Published successfully");
            fetchExams();
        } catch {
            toast.error("Publish failed");
        }
    };

    // ================= EDIT OPEN =================
    const handleEditOpen = (exam: Exam) => {
        if (userType === "teacher") return; // ✅ ADDED

        setSelectedExam(exam);

        const d = new Date(exam.startTime);
        const date = d.toISOString().split("T")[0];

        const hour = d.getHours().toString().padStart(2, "0");

        let slot = "";
        if (hour === "10") slot = "10:00-11:00";
        else if (hour === "12") slot = "12:00-13:00";
        else if (hour === "14") slot = "14:00-15:00";

        setEditData({ date, timeSlot: slot });
        setShowEditModal(true);
    };

    // ================= EDIT SUBMIT =================
    const handleEditSubmit = async () => {
        if (userType === "teacher") return; // ✅ ADDED

        try {
            if (!editData.date || !editData.timeSlot || !selectedExam) {
                return toast.error("All fields required");
            }

            const [startTime, endTime] = editData.timeSlot.split("-");

            await API.put(
                `/super/v1/changetimedate/${selectedExam.id}`,
                {
                    date: editData.date,
                    startTime,
                    endTime,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Exam updated successfully");
            setShowEditModal(false);
            fetchExams();
        } catch {
            toast.error("Update failed");
        }
    };

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Exam List</h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + Create Exam
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white shadow rounded">
                <table className="w-full text-center">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">Title</th>
                            <th>Duration</th>
                            <th>Total Marks</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Published</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {exams.map((exam) => (
                            <tr key={exam.id} className="border-t">
                                <td className="p-3">{exam.title}</td>
                                <td>{formatDuration(exam.duration)}</td>
                                <td>{exam.totalMarks}</td>
                                <td>{formatDate(exam.startTime)}</td>
                                <td>{formatTime(exam.startTime)}</td>

                                <td>
                                    {exam.isPublished ? (
                                        <span className="text-green-600 font-semibold">
                                            Published
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">
                                            Not Published
                                        </span>
                                    )}
                                </td>

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

                                <td className="flex justify-center gap-3 p-2">
                                    {/* EDIT */}
                                    <button
                                        onClick={() => handleEditOpen(exam)}
                                        disabled={exam.isDeleted || userType === "teacher"}
                                        className={`p-2 rounded ${exam.isDeleted || userType === "teacher"
                                                ? "bg-gray-200 cursor-not-allowed opacity-50"
                                                : "hover:bg-blue-100"
                                            }`}
                                    >
                                        <Edit2 size={18} />
                                    </button>

                                    {/* PUBLISH */}
                                    <button
                                        onClick={() => handlePublish(exam.id)}
                                        disabled={exam.isPublished || userType === "teacher"}
                                        className={`p-2 rounded ${exam.isPublished || userType === "teacher"
                                                ? "bg-gray-200 cursor-not-allowed opacity-50"
                                                : "hover:bg-green-100"
                                            }`}
                                    >
                                        <Upload size={18} />
                                    </button>

                                    {/* DELETE */}
                                    <button
                                        onClick={() => handleDelete(exam.id)}
                                        disabled={exam.isDeleted || userType === "teacher"}
                                        className={`p-2 rounded ${exam.isDeleted || userType === "teacher"
                                                ? "bg-gray-200 cursor-not-allowed opacity-50"
                                                : "hover:bg-red-100"
                                            }`}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded w-[400px]">
                        <h2 className="text-lg font-bold mb-4">Create Exam</h2>

                        <input
                            name="title"
                            placeholder="Title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full mb-3 p-2 border rounded"
                        />

                        <input
                            name="duration"
                            placeholder="Duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full mb-3 p-2 border rounded"
                        />

                        <input
                            name="totalMarks"
                            placeholder="Marks"
                            value={formData.totalMarks}
                            onChange={handleChange}
                            className="w-full mb-3 p-2 border rounded"
                        />

                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full mb-3 p-2 border rounded"
                        />

                        <select
                            name="timeSlot"
                            value={formData.timeSlot}
                            onChange={handleChange}
                            className="w-full mb-4 p-2 border rounded"
                        >
                            <option value="">Select Time</option>
                            <option value="10:00-11:00">10-11</option>
                            <option value="12:00-13:00">12-1</option>
                            <option value="14:00-15:00">2-3</option>
                        </select>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button onClick={handleCreate}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded w-[400px]">
                        <h2 className="text-lg font-bold mb-2">Edit Exam</h2>

                        <p className="mb-3 font-semibold">
                            {selectedExam?.title}
                        </p>

                        <input
                            type="date"
                            value={editData.date}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    date: e.target.value,
                                })
                            }
                            className="w-full mb-3 p-2 border rounded"
                        />

                        <select
                            value={editData.timeSlot}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    timeSlot: e.target.value,
                                })
                            }
                            className="w-full mb-4 p-2 border rounded"
                        >
                            <option value="">Select Time</option>
                            <option value="10:00-11:00">10:00 - 11:00</option>
                            <option value="12:00-13:00">12:00 - 1:00</option>
                            <option value="14:00-15:00">2:00 - 3:00</option>
                        </select>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}