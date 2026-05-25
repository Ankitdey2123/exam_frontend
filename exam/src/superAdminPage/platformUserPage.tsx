import { useEffect, useState } from "react";
import API from "../API_Service/apiService";
import toast from "react-hot-toast";
import { Eye, EyeOff, Trash2, UserCog } from "lucide-react"; // ✅ added icon

interface User {
    id: number;
    name: string;
    email: string;
    status: boolean;
    isDeleted: boolean;
}

// ================= ROLE INTERFACE =================
interface Role {
    id: number;
    name: string;
    description: string;
}

// ================= ROLE INTERFACE =================
interface AssignedRole {
    userId: number;
    roleId: number;
    roleName: string;
}

export default function PlatformUserPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [showModal, setShowModal] = useState(false);

    // ✅ ASSIGN ROLE STATES (ADDED)
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState("");

    const [roles, setRoles] = useState<Role[]>([]);

    const [assignedRoles, setAssignedRoles] =
        useState<AssignedRole[]>([]);

    const [showPassword, setShowPassword] =
        useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const token = sessionStorage.getItem("accessToken");

    // ================= FETCH USERS =================
    const fetchUsers = async () => {
        try {

            const res = await API.get(
                "/super/v1/platformuser",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // ✅ SHOW ONLY PLATFORM USERS
            const filteredUsers =
                res.data.data.filter((user: User) => {

                    // ❌ HIDE DELETED USERS
                    if (user.isDeleted) {
                        return false;
                    }

                    // ✅ SHOW SUPER ADMIN
                    if (
                        user.email.endsWith("@superadmin.com")
                    ) {
                        return true;
                    }

                    // ✅ SHOW ADMIN
                    if (
                        user.email.endsWith("@admin.com")
                    ) {
                        return true;
                    }

                    // ✅ SHOW TEACHER
                    if (
                        user.email.endsWith("@teacher.com")
                    ) {
                        return true;
                    }

                    // ❌ HIDE STUDENTS
                    return false;
                });

            setUsers(filteredUsers);

        } catch {

            toast.error("Failed to fetch users");

        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // ================= FETCH ROLES =================
    const fetchRoles = async () => {

        try {

            const res = await API.get(
                "/super/v1/getallrole",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setRoles(res.data.data);

        } catch {

            toast.error(
                "Failed to fetch roles"
            );

        }
    };

    // ================= USE EFFECT =================
    useEffect(() => {

        fetchUsers();

        fetchRoles();

    }, []);

    // ================= FETCH ASSIGNED ROLES =================
    const fetchAssignedRoles = async () => {

        try {

            const res = await API.get(
                "/super/v1/getuserallrole",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAssignedRoles(res.data.data);

        } catch {

            toast.error(
                "Failed to fetch assigned roles"
            );

        }
    };

    useEffect(() => {

        fetchUsers();

        fetchRoles();

        fetchAssignedRoles();

    }, []);

    // ================= GET USER ASSIGNED ROLES =================
    const getUserRoles = (userId: number) => {

        return assignedRoles.filter(
            (role) => role.userId === userId
        );
    };

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
        if (email.includes("@superadmin")) return "Super Admin";
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

                        {/* USER EMAIL */}
                        <p className="mb-3 font-semibold">
                            {selectedUser.email}
                        </p>

                        {/* ALREADY ASSIGNED ROLES */}
                        <div className="mb-4">

                            <p className="text-sm font-semibold mb-2">
                                Already Assigned Roles
                            </p>

                            <div className="flex flex-wrap gap-2">

                                {getUserRoles(selectedUser.id)
                                    .length > 0 ? (

                                    getUserRoles(selectedUser.id)
                                        .map((role) => (

                                            <span
                                                key={role.roleId}
                                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                                            >
                                                {role.roleName}
                                            </span>

                                        ))

                                ) : (

                                    <span className="text-gray-500 text-sm">
                                        No roles assigned
                                    </span>

                                )}

                            </div>

                        </div>

                        {/* ROLE SELECT */}
                        <select
                            value={selectedRole}
                            onChange={(e) =>
                                setSelectedRole(
                                    e.target.value
                                )
                            }
                            className="w-full mb-4 p-2 border rounded"
                        >

                            <option value="">
                                Select Role
                            </option>

                            {roles
                                .filter((role) => {

                                    // REMOVE ALREADY ASSIGNED ROLES
                                    return !getUserRoles(
                                        selectedUser.id
                                    ).some(
                                        (assignedRole) =>
                                            assignedRole.roleName ===
                                            role.name
                                    );
                                })
                                .map((role) => (

                                    <option
                                        key={role.id}
                                        value={role.name}
                                    >
                                        {role.name}
                                    </option>

                                ))}

                        </select>

                        <div className="flex justify-end gap-3">

                            <button
                                onClick={() =>
                                    setShowAssignModal(false)
                                }
                            >
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

                        <div className="relative mb-4">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-2 border rounded pr-10"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>

                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="px-3 py-2 bg-gray-300 rounded">
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