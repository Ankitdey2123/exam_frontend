import { useEffect, useState } from "react";
import API from "../API_Service/apiService";
import toast from "react-hot-toast";
import {
    Trash2,
    KeyRound,
    Eye,
    EyeOff,
} from "lucide-react";

interface User {
    id: number;
    name: string;
    email: string;
    status: boolean;
    isDeleted: boolean;
}

export default function StudentUserPage() {

    const [users, setUsers] = useState<User[]>([]);

    // CHANGE PASSWORD MODAL
    const [showPasswordModal, setShowPasswordModal] =
        useState(false);

    const [selectedUser, setSelectedUser] =
        useState<User | null>(null);

    const [newPassword, setNewPassword] =
        useState("");

    // SHOW / HIDE PASSWORD
    const [showPassword, setShowPassword] =
        useState(false);

    const token =
        sessionStorage.getItem("accessToken");

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

            // FILTER ONLY STUDENTS
            const filteredUsers =
                res.data.data.filter((user: User) => {

                    if (user.isDeleted) return false;

                    if (
                        user.email.endsWith("@admin.com")
                    ) {
                        return false;
                    }

                    if (
                        user.email.endsWith("@teacher.com")
                    ) {
                        return false;
                    }

                    if (
                        user.email.endsWith("@superadmin.com")
                    ) {
                        return false;
                    }

                    return true;
                });

            setUsers(filteredUsers);

        } catch {

            toast.error(
                "Failed to fetch students"
            );

        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // ================= DELETE =================
    const handleDelete = (id: number) => {

        toast(
            (t) => (
                <div className="flex flex-col gap-3">

                    <span className="font-medium">
                        Are you sure want to delete this account?
                    </span>

                    <div className="flex justify-end gap-2">

                        <button
                            onClick={() =>
                                toast.dismiss(t.id)
                            }
                            className="px-3 py-1 bg-gray-300 rounded"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={async () => {

                                toast.dismiss(t.id);

                                try {

                                    await API.put(
                                        `/super/v1/deletestudent/${id}`,
                                        {},
                                        {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        }
                                    );

                                    toast.success(
                                        "Student deleted successfully"
                                    );

                                    fetchUsers();

                                } catch {

                                    toast.error(
                                        "Failed to delete student"
                                    );

                                }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            ),
            { duration: Infinity }
        );
    };

    // ================= OPEN PASSWORD MODAL =================
    const openPasswordModal = (
        user: User
    ) => {

        setSelectedUser(user);

        setNewPassword("");

        setShowPassword(false);

        setShowPasswordModal(true);
    };

    // ================= CHANGE PASSWORD =================
    const handleChangePassword = async () => {

        try {

            if (!newPassword) {
                return toast.error(
                    "New password required"
                );
            }

            await API.put(
                `/super/v1/stuchangepassword/${selectedUser?.id}`,
                {
                    newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(
                "Password changed successfully"
            );

            setShowPasswordModal(false);

            setNewPassword("");

        } catch {

            toast.error(
                "Failed to change password"
            );

        }
    };

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between mb-4">

                <h1 className="text-2xl font-bold">
                    Students
                </h1>

            </div>

            {/* TABLE */}
            <div className="bg-white shadow rounded overflow-hidden">

                <table className="w-full text-center">

                    <thead className="bg-gray-100">

                        <tr>
                            <th className="p-3">
                                Name
                            </th>

                            <th>
                                Email
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Action
                            </th>
                        </tr>

                    </thead>

                    <tbody>

                        {users.map((user) => (

                            <tr
                                key={user.id}
                                className="border-t"
                            >

                                <td className="p-3">
                                    {user.name}
                                </td>

                                <td>
                                    {user.email}
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

                                {/* ACTIONS */}
                                <td className="p-2 flex justify-center gap-3">

                                    {/* CHANGE PASSWORD */}
                                    <button
                                        onClick={() =>
                                            openPasswordModal(
                                                user
                                            )
                                        }
                                        className="p-2 hover:bg-blue-100 rounded"
                                        title="Change Password"
                                    >
                                        <KeyRound
                                            size={18}
                                            className="text-blue-600"
                                        />
                                    </button>

                                    {/* DELETE */}
                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                user.id
                                            )
                                        }
                                        className="p-2 hover:bg-red-100 rounded"
                                        title="Delete"
                                    >
                                        <Trash2
                                            size={18}
                                            className="text-red-600"
                                        />
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* ================= CHANGE PASSWORD MODAL ================= */}
            {showPasswordModal && (

                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

                    <div className="bg-white p-6 rounded-lg w-[400px]">

                        <h2 className="text-xl font-bold mb-4">
                            Change Password
                        </h2>

                        {/* PASSWORD FIELD */}
                        <div className="relative mb-4">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(
                                        e.target.value
                                    )
                                }
                                className="w-full border p-2 rounded pr-12"
                            />

                            {/* SHOW / HIDE ICON */}
                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                className="absolute right-3 top-2.5 text-gray-500"
                            >

                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}

                            </button>

                        </div>

                        <div className="flex justify-end gap-3">

                            <button
                                onClick={() =>
                                    setShowPasswordModal(
                                        false
                                    )
                                }
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleChangePassword}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Change Password
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}