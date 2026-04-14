import toast from 'react-hot-toast';
import { useEffect, useState } from "react";
import API from "../API_Service/apiService";
import { Edit2, Trash2 } from "lucide-react";

interface Permission {
    id: number;
    name: string;
    description: string;
}

export default function PermissionPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] =
        useState<Permission | null>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    // ✅ Better snackbar
    const [snackbar, setSnackbar] = useState({
        message: "",
        type: "", // success | error
    });

    const token = sessionStorage.getItem("accessToken");

    // ✅ AUTO HIDE SNACKBAR
    useEffect(() => {
        if (snackbar.message) {
            const timer = setTimeout(() => {
                setSnackbar({ message: "", type: "" });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [snackbar]);

    // ✅ GET ALL PERMISSIONS
    const fetchPermissions = async () => {
        try {
            const res = await API.get(
                "http://localhost:8080/api/super/v1/getallPermission",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setPermissions(res.data.data);
        } catch (err) {
            setSnackbar({
                message: "Error fetching permissions ❌",
                type: "error",
            });
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    // ✅ CREATE PERMISSION
    const handleCreate = async () => {
        if (!name || !description) return;

        try {
            await API.post(
                "http://localhost:8080/api/super/v1/createpermission",
                { name, description },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSnackbar({
                message: "Permission created successfully ✅",
                type: "success",
            });

            setShowModal(false);
            setName("");
            setDescription("");

            fetchPermissions(); // refresh
        } catch (err) {
            setSnackbar({
                message: "Error creating permission ❌",
                type: "error",
            });
        }
    };

    // ✅ OPEN EDIT MODAL
    const handleEditClick = (permission: Permission) => {
        setSelectedPermission(permission);
        setFormData({
            name: permission.name,
            description: permission.description,
        });
        setIsModalOpen(true);
    };

    // ✅ HANDLE CHANGE
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // ✅ UPDATE PERMISSION
    const handleUpdate = async () => {
        if (!selectedPermission) return;

        try {
            const res = await API.put(
                `/super/v1/updatePermission/${selectedPermission.id}`,
                {
                    name: formData.name,
                    description: formData.description,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data.success) {
                setSnackbar({
                    message: "Permission updated successfully ✅",
                    type: "success",
                });

                setIsModalOpen(false);

                fetchPermissions(); // 🔥 AUTO REFRESH
            }
        } catch (error) {
            setSnackbar({
                message: "Error updating permission ❌",
                type: "error",
            });
        }
    };

    //handel delete permission
    const handleDelete = (id: number) => {
        // Show toast with Yes / No buttons
        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <span>Are you sure you want to delete?</span>
                    <div className="flex gap-2 justify-end">
                        <button
                            className="px-2 py-1 bg-gray-300 rounded"
                            onClick={() => toast.dismiss(t.id)}
                        >
                            No
                        </button>
                        <button
                            className="px-2 py-1 bg-red-600 text-white rounded"
                            onClick={async () => {
                                toast.dismiss(t.id); // close the toast first
                                try {
                                    await API.delete(`/super/v1/deletePermission/${id}`, {
                                        headers: { Authorization: `Bearer ${token}` },
                                    });
                                    setPermissions((prev) =>
                                        prev.filter((item) => item.id !== id)
                                    );
                                    toast.success("Permission deleted successfully ✅");
                                } catch (error) {
                                    toast.error("Error deleting permission ❌");
                                }
                            }}
                        >
                            Yes
                        </button>
                    </div>
                </div>
            ),
            { duration: Infinity } // keep open until user clicks
        );
    };

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Permission</h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    + Create Permission
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-600 text-sm">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {permissions.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="p-3">{item.name}</td>
                                <td className="p-3">{item.description}</td>
                                <td className="p-3">
                                    <button
                                        className="p-2 rounded hover:bg-gray-200"
                                        title="Edit"
                                        onClick={() => handleEditClick(item)}
                                    >
                                        <Edit2 size={18} className="text-blue-600" />
                                    </button>

                                    {/* DELETE */}
                                    <button
                                        className="p-2 rounded hover:bg-gray-200"
                                        title="Delete"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 size={18} className="text-red-600" />
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
                    <div className="bg-white p-6 rounded-lg w-[400px]">
                        <h2 className="text-lg font-semibold mb-4">
                            Create Permission
                        </h2>

                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />

                        <input
                            type="text"
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
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
                                onClick={handleCreate}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-[400px]">
                        <h2 className="text-lg font-semibold mb-4">
                            Edit Permission
                        </h2>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full mb-4 px-3 py-2 border rounded"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SNACKBAR */}
            {snackbar.message && (
                <div
                    className={`fixed top-5 right-5 px-4 py-2 rounded shadow text-white z-50
          ${snackbar.type === "success" ? "bg-green-600" : "bg-red-600"}`}
                >
                    {snackbar.message}
                </div>
            )}
        </div>
    );
}