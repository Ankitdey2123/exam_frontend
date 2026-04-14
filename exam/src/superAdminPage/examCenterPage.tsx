import { useEffect, useState } from "react";
import API from "../API_Service/apiService";
import toast from "react-hot-toast";
import { Edit2, Plus } from "lucide-react";

interface Center {
    id: number;
    state: string;
    city: string;
    address: string;
}

export default function ExamCenterPage() {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        stateName: "",
        cityName: "",
        address: "",
    });

    const token = sessionStorage.getItem("accessToken");

    // ================= FETCH =================
    const fetchCenters = async () => {
        try {
            setLoading(true);
            const res = await API.get("/super/v1/getallexamcenter", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCenters(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch centers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCenters();
    }, []);

    // ================= INPUT =================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // ================= OPEN CREATE =================
    const handleCreateOpen = () => {
        setIsEdit(false);
        setFormData({
            stateName: "",
            cityName: "",
            address: "",
        });
        setShowModal(true);
    };

    // ================= OPEN EDIT =================
    const handleEditOpen = (center: Center) => {
        setIsEdit(true);
        setSelectedId(center.id);
        setFormData({
            stateName: center.state,
            cityName: center.city,
            address: center.address,
        });
        setShowModal(true);
    };

    // ================= SUBMIT =================
    const handleSubmit = async () => {
        try {
            if (!formData.stateName || !formData.cityName || !formData.address) {
                return toast.error("All fields are required");
            }

            if (isEdit && selectedId !== null) {
                await API.put(
                    `/super/v1/updatecenter/${selectedId}`,
                    formData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                toast.success("Center updated successfully");
            } else {
                await API.post("/super/v1/createcenter", formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Center created successfully");
            }

            setShowModal(false);
            fetchCenters();
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Exam Centers</h1>

                <button
                    onClick={handleCreateOpen}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Create Center
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">State</th>
                            <th className="p-3">City</th>
                            <th className="p-3">Address</th>
                            <th className="p-3 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="text-center p-4">
                                    Loading...
                                </td>
                            </tr>
                        ) : centers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center p-4">
                                    No Centers Found
                                </td>
                            </tr>
                        ) : (
                            centers.map((center) => (
                                <tr key={center.id} className="border-t">
                                    <td className="p-3">{center.state}</td>
                                    <td className="p-3">{center.city}</td>
                                    <td className="p-3">{center.address}</td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => handleEditOpen(center)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ✅ MODAL (Same as Permission Page) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-[400px]">
                        <h2 className="text-lg font-semibold mb-4">
                            {isEdit ? "Edit Center" : "Create Center"}
                        </h2>

                        <input
                            type="text"
                            name="stateName"
                            placeholder="State"
                            value={formData.stateName}
                            onChange={handleChange}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />

                        <input
                            type="text"
                            name="cityName"
                            placeholder="City"
                            value={formData.cityName}
                            onChange={handleChange}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />

                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full mb-4 px-3 py-2 border rounded"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                {isEdit ? "Update" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}