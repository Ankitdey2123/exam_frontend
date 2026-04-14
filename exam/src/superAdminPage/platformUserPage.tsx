import { useEffect, useState } from "react";
import API from "../API_Service/apiService";
import toast from "react-hot-toast";
import { Trash2, UserCog } from "lucide-react"; // ✅ added icon

interface User {
    id: number;
    name: string;
    email: string;
    status: boolean;
    isDeleted: boolean;
}

export default function PlatformUserPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [showModal, setShowModal] = useState(false);

    // ✅ ASSIGN ROLE STATES (ADDED)
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const token = sessionStorage.getItem("accessToken");

    // ================= FETCH USERS =================
    const fetchUsers = async () => {
        try {
            const res = await API.get("/super/v1/platformuser", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUsers(res.data.data);
        } catch {
            toast.error("Failed to fetch users");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // ================= HANDLE CHANGE =================
    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ================= CREATE USER =================
    const handleCreate = async () => {
        try {
            if (!formData.name || !formData.email || !formData.password) {
                return toast.error("All fields required");
            }

            await API.post(
                "/super/v1/createteacher",
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("User created successfully");

            setShowModal(false);
            setFormData({
                name: "",
                email: "",
                password: "",
            });

            fetchUsers();
        } catch {
            toast.error("Error creating user");
        }
    };

    // ================= DELETE USER =================
    const handleDelete = (id: number) => {
        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <span>Delete this user?</span>

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
                                        `/super/v1/removeplatformuser/${id}`,
                                        {},
                                        {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        }
                                    );

                                    toast.success("User deleted successfully");
                                    fetchUsers();
                                } catch {
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

    // ================= ASSIGN ROLE =================
    const handleAssignRole = async () => {
        try {
            if (!selectedRole || !selectedUser) {
                return toast.error("Select role");
            }

            await API.post(
                "/super/v1/assignrole",
                {
                    roleName: selectedRole,
                    userEmail: selectedUser.email,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Role assigned successfully");
            setShowAssignModal(false);
            setSelectedRole("");
        } catch {
            toast.error("Failed to assign role");
        }
    };

    // ================= ROLE =================
    const getRole = (email: string) => {
        if (email.includes("@admin")) return "Super Admin";
        if (email.includes("@teacher")) return "Platform User";
        return "User";
    };

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Platform Users</h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + Create User
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white shadow rounded">
                <table className="w-full text-center">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Exist Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="p-3">{user.name}</td>
                                <td>{user.email}</td>

                                <td>
                                    <span className="font-semibold text-blue-600">
                                        {getRole(user.email)}
                                    </span>
                                </td>

                                <td>
                                    {user.status ? (
                                        <span className="text-green-600 font-semibold">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="text-red-600 font-semibold">
                                            Deactive
                                        </span>
                                    )}
                                </td>

                                <td>
                                    {!user.isDeleted ? (
                                        <span className="text-green-600 font-semibold">
                                            Exist
                                        </span>
                                    ) : (
                                        <span className="text-red-600 font-semibold">
                                            Not Exist
                                        </span>
                                    )}
                                </td>

                                {/* ACTIONS */}
                                <td className="p-2 flex justify-center gap-3">

                                    {/* ASSIGN ROLE ICON */}
                                    <button
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setShowAssignModal(true);
                                        }}
                                        className="p-2 hover:bg-blue-100 rounded"
                                        title="Assign Role"
                                    >
                                        <UserCog size={18} className="text-blue-600" />
                                    </button>

                                    {/* DELETE */}
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        disabled={user.isDeleted}
                                        className={`p-2 rounded ${user.isDeleted
                                                ? "bg-gray-200 cursor-not-allowed opacity-50"
                                                : "hover:bg-red-100"
                                            }`}
                                    >
                                        <Trash2
                                            size={18}
                                            className={
                                                user.isDeleted
                                                    ? "text-gray-400"
                                                    : "text-red-600"
                                            }
                                        />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ================= ASSIGN ROLE MODAL ================= */}
            {showAssignModal && selectedUser && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded w-[400px]">
                        <h2 className="text-lg font-bold mb-4">
                            Assign Role
                        </h2>

                        <p className="mb-2 font-semibold">
                            {selectedUser.email}
                        </p>

                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full mb-4 p-2 border rounded"
                        >
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                        </select>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowAssignModal(false)}>
                                Cancel
                            </button>

                            <button
                                onClick={handleAssignRole}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE MODAL (UNCHANGED) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded w-[400px]">
                        <h2 className="text-lg font-bold mb-4">
                            Create Platform User
                        </h2>

                        <input
                            name="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full mb-3 p-2 border rounded"
                        />

                        <input
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full mb-3 p-2 border rounded"
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full mb-4 p-2 border rounded"
                        />

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)}>
                                Cancel
                            </button>

                            <button
                                onClick={handleCreate}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}