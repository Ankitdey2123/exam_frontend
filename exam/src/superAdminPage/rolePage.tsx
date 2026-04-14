import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../API_Service/apiService";
import { Trash2, ShieldPlus, Edit2 } from "lucide-react";

interface Role {
    id: number;
    name: string;
    description: string;
}

interface Permission {
    id: number;
    name: string;
}

export default function RolePage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);

    const [showModal, setShowModal] = useState(false);
    const [permissionModal, setPermissionModal] = useState(false);

    // ✅ ADDED STATES (EDIT FEATURE)
    const [editModal, setEditModal] = useState(false);
    const [editRole, setEditRole] = useState<Role | null>(null);
    const [removablePermissions, setRemovablePermissions] = useState<number[]>([]);

    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [assignedPermissions, setAssignedPermissions] = useState<number[]>([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const token = sessionStorage.getItem("accessToken");

    // ================= GET ROLES =================
    const fetchRoles = async () => {
        try {
            const res = await API.get(
                "http://localhost:8080/api/super/v1/getallrole",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setRoles(res.data.data);
        } catch {
            toast.error("Error fetching roles ❌");
        }
    };

    // ================= GET PERMISSIONS =================
    const fetchPermissions = async () => {
        try {
            const res = await API.get(
                "super/v1/getallPermission",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setPermissions(res.data.data);
        } catch {
            toast.error("Error fetching permissions ❌");
        }
    };

    // ================= FETCH ASSIGNED PERMISSIONS =================
    const fetchAssignedPermissions = async (roleId: number) => {
        try {
            const res = await API.get(
                `super/v1/fetchpermission/${roleId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const assigned = res.data.data.map((p: any) => p.permissionId);

            setAssignedPermissions(assigned);
            setSelectedPermissions(assigned);
        } catch {
            toast.error("Error fetching assigned permissions ❌");
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // ================= CREATE ROLE =================
    const handleCreate = async () => {
        if (!name || !description) {
            toast.error("All fields required ❌");
            return;
        }

        try {
            await API.post(
                "http://localhost:8080/api/super/v1/createrole",
                { name, description },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success("Role created ✅");

            setShowModal(false);
            setName("");
            setDescription("");
            fetchRoles();
        } catch {
            toast.error("Error creating role ❌");
        }
    };

    // ================= DELETE ROLE =================
    const handleDelete = (id: number) => {
        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <span>Are you sure you want to delete?</span>
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-2 py-1 bg-gray-300 rounded"
                            onClick={() => toast.dismiss(t.id)}
                        >
                            No
                        </button>
                        <button
                            className="px-2 py-1 bg-red-600 text-white rounded"
                            onClick={async () => {
                                toast.dismiss(t.id);
                                try {
                                    await API.delete(
                                        `http://localhost:8080/api/super/v1/deleterole/${id}`,
                                        {
                                            headers: { Authorization: `Bearer ${token}` },
                                        }
                                    );

                                    setRoles((prev) =>
                                        prev.filter((item) => item.id !== id)
                                    );

                                    toast.success("Role deleted ✅");
                                } catch {
                                    toast.error("Error deleting role ❌");
                                }
                            }}
                        >
                            Yes
                        </button>
                    </div>
                </div>
            ),
            { duration: Infinity }
        );
    };

    // ================= SELECT PERMISSIONS =================
    const handleSelectPermission = (id: number) => {
        setSelectedPermissions((prev) =>
            prev.includes(id)
                ? prev.filter((p) => p !== id)
                : [...prev, id]
        );
    };

    // ✅ REMOVE SELECT (NEW)
    const handleRemoveSelection = (id: number) => {
        setRemovablePermissions((prev) =>
            prev.includes(id)
                ? prev.filter((p) => p !== id)
                : [...prev, id]
        );
    };

    // ================= ASSIGN PERMISSIONS =================
    const handleAssignPermissions = async () => {
        if (!selectedRoleId) {
            toast.error("No role selected ❌");
            return;
        }

        const newPermissions = selectedPermissions.filter(
            (id) => !assignedPermissions.includes(id)
        );

        if (newPermissions.length === 0) {
            toast.error("No new permissions selected ❌");
            return;
        }

        const permissionNames = permissions
            .filter((p) => newPermissions.includes(p.id))
            .map((p) => p.name);

        try {
            await API.post(
                `/super/v1/assignpermission/${selectedRoleId}`,
                { permissionName: permissionNames },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success("Permissions assigned ✅");

            setPermissionModal(false);
            setSelectedPermissions([]);
            setAssignedPermissions([]);
        } catch {
            toast.error("Error assigning permissions ❌");
        }
    };

    // ✅ REMOVE PERMISSIONS API (NEW)
    const handleRemovePermissions = async () => {
        if (!selectedRoleId) {
            toast.error("No role selected ❌");
            return;
        }

        if (removablePermissions.length === 0) {
            toast.error("No permissions selected ❌");
            return;
        }

        const permissionNames = permissions
            .filter((p) => removablePermissions.includes(p.id))
            .map((p) => p.name);

        try {
            await API.post(
                `/super/v1/removepermission/${selectedRoleId}`,
                {
                    permissionName: permissionNames,
                }, {
                headers: { Authorization: `Bearer ${token}` },
            }
            );

            toast.success("Permissions removed ✅");

            setEditModal(false);
            setRemovablePermissions([]);
        } catch {
            toast.error("Error removing permissions ❌");
        }
    };

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Role</h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + Create Role
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white shadow rounded overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100 text-sm text-gray-600">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Description</th>
                            <th className="p-3 text-left">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {roles.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="p-3">{item.name}</td>
                                <td className="p-3">{item.description}</td>

                                <td className="p-3 flex gap-2">
                                    {/* ASSIGN */}
                                    <button
                                        onClick={() => {
                                            setSelectedRoleId(item.id);
                                            setPermissionModal(true);
                                            fetchPermissions();
                                            fetchAssignedPermissions(item.id);
                                        }}
                                        className="p-2 hover:bg-gray-200 rounded"
                                        title="Assign Role"
                                    >
                                        <ShieldPlus size={18} className="text-green-600" />
                                    </button>

                                    {/* ✅ EDIT BUTTON (NEW) */}
                                    <button
                                        onClick={() => {
                                            setEditRole(item);
                                            setSelectedRoleId(item.id);
                                            setEditModal(true);
                                            fetchPermissions();
                                            fetchAssignedPermissions(item.id);
                                        }}
                                        title="edit"
                                        className="p-2 hover:bg-gray-200 rounded"
                                    >
                                        <Edit2 size={18} />
                                    </button>

                                    {/* DELETE */}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 hover:bg-gray-200 rounded"
                                        title="delete"
                                    >
                                        <Trash2 size={18} className="text-red-600" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ✅ CREATE MODAL (UNCHANGED) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded w-[400px]">
                        <h2 className="text-lg font-semibold mb-4">Create Role</h2>

                        <input
                            type="text"
                            placeholder="Role Name"
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

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-3 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleCreate}
                                className="px-3 py-2 bg-blue-600 text-white rounded"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PERMISSION MODAL (UNCHANGED) */}
            {permissionModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded w-[450px]">
                        <h2 className="text-lg font-semibold mb-4">
                            Assign Permissions
                        </h2>

                        <div className="max-h-60 overflow-y-auto border rounded p-2">
                            {permissions.map((perm) => (
                                <label key={perm.id} className="flex items-center gap-2 p-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes(perm.id)}
                                        disabled={assignedPermissions.includes(perm.id)}
                                        onChange={() =>
                                            handleSelectPermission(perm.id)
                                        }
                                    />
                                    {perm.name}
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => {
                                    setPermissionModal(false);
                                    setSelectedPermissions([]);
                                    setAssignedPermissions([]);
                                }}
                                className="px-3 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAssignPermissions}
                                className="px-3 py-2 bg-green-600 text-white rounded"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ EDIT MODAL (NEW ONLY) */}
            {editModal && editRole && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded w-[450px]">
                        <h2 className="text-lg font-semibold mb-4">
                            Edit Role Permissions
                        </h2>

                        <input
                            value={editRole.name}
                            disabled
                            className="w-full mb-3 px-3 py-2 border rounded bg-gray-100"
                        />

                        <input
                            value={editRole.description}
                            disabled
                            className="w-full mb-4 px-3 py-2 border rounded bg-gray-100"
                        />
                        <h4>Assign Permission</h4>
                        <div className="max-h-60 overflow-y-auto border rounded p-2">
                            {assignedPermissions.length === 0 ? (
                                <div className="text-center text-gray-500 py-6">
                                    No permissions assigned ❌

                                    <button
                                        onClick={() => {
                                            setEditModal(false);
                                            setPermissionModal(true);
                                        }}
                                        className="block mt-3 mx-auto px-3 py-1 bg-green-600 text-white rounded"
                                    >
                                        Assign Permission
                                    </button>
                                </div>
                            ) : (
                                permissions
                                    .filter((perm) =>
                                        assignedPermissions.includes(perm.id)
                                    )
                                    .map((perm) => (
                                        <label
                                            key={perm.id}
                                            className="flex items-center gap-2 p-1"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={removablePermissions.includes(perm.id)}
                                                onChange={() =>
                                                    handleRemoveSelection(perm.id)
                                                }
                                            />
                                            {perm.name}
                                        </label>
                                    ))
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setEditModal(false)}
                                className="px-3 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleRemovePermissions}
                                className="px-3 py-2 bg-red-600 text-white rounded"
                            >
                                Remove Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}