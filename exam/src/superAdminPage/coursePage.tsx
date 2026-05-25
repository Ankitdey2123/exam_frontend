import { useEffect, useState } from "react";
import API from "../API_Service/apiService";
import { Edit2, Trash2, Plus, Megaphone } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    isPublished?: boolean;
}

export default function CoursePage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);
    //edit modal data
    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
        image: null as File | null,
    });

    //create modal data
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image: null as File | null,
    });

    // ✅ AUTH HEADER
    const getAuthHeader = () => {
        const token = sessionStorage.getItem("accessToken");
        return {
            Authorization: `Bearer ${token}`,
        };
    };

    // ✅ USER ID FROM TOKEN
    const getUserIdFromToken = () => {
        const token = sessionStorage.getItem("accessToken");
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.id;
    };

    // ✅ FETCH COURSES
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

    // ✅ INPUT CHANGE
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // ✅ IMAGE CHANGE
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData({
                ...formData,
                image: e.target.files[0],
            });
        }
    };

    //for edit modal
    const handleEditClick = (course: Course) => {
        setEditId(course.id);

        setEditFormData({
            title: course.title,
            description: course.description,
            image: null, // new file only
        });

        // store existing image separately (IMPORTANT)
        setExistingImage(course.imageUrl);

        setShowEditModal(true);
    };

    // ✅ CREATE COURSE
    const handleCreateCourse = async () => {
        try {
            const userId = getUserIdFromToken();

            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("price", "0");
            data.append("createdBy", String(userId));

            if (formData.image) {
                data.append("image", formData.image);
            }

            await API.post("/super/v1/create/course", data, {
                headers: {
                    ...getAuthHeader(),
                    "Content-Type": "multipart/form-data",
                },
            });

            setShowModal(false);

            setFormData({
                title: "",
                description: "",
                image: null,
            });

            fetchCourses();
        } catch (err) {
            console.error("Create error:", err);
        }
    };

    const handleDeleteCourse = (id: number) => {
        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <span className="font-medium">Delete this course?</span>

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
                                    await API.delete(
                                        `/super/v1/coursedelete/${id}`,
                                        {
                                            headers: getAuthHeader(),
                                        }
                                    );

                                    toast.success("Course deleted successfully");
                                    fetchCourses();
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
    const handleUpdateCourse = async () => {
        try {
            const payload = {
                title: editFormData.title,
                description: editFormData.description,
                imageUrl: editFormData.image
                    ? editFormData.image.name
                    : existingImage,
            };

            await API.put(
                `/super/v1/courseupdate/${editId}`,
                payload,
                {
                    headers: getAuthHeader(),
                }
            );

            setShowEditModal(false);
            setEditId(null);
            fetchCourses();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePublish = (id: number, isPublished: boolean) => {
        if (isPublished) return;

        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <span>Are you sure to publish this?</span>

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
                                        `/super/v1/coursepublish/${id}`,
                                        {},
                                        { headers: getAuthHeader() }
                                    );

                                    toast.success("Published successfully");
                                    fetchCourses();
                                } catch (err) {
                                    toast.error("Publish failed");
                                }
                            }}
                            className="px-2 py-1 bg-green-600 text-white rounded"
                        >
                            Yes
                        </button>
                    </div>
                </div>
            ),
            { duration: Infinity }
        );
    };

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Course Page</h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
                >
                    <Plus size={18} />
                    Create Course
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white shadow rounded">
                <table className="w-full text-center">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">Image</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {courses.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-4">
                                    No Courses Found
                                </td>
                            </tr>
                        ) : (
                            courses.map((course) => (
                                <tr key={course.id} className="border-m"
                                >
                                    {/* ✅ IMAGE FROM ASSETS */}
                                    <td>
                                        <img
                                            onClick={() => navigate(`/course-videos/${course.id}`)}
                                            src={new URL(
                                                `../assets/${course.imageUrl}`,
                                                import.meta.url
                                            ).href}
                                            alt="course"
                                            className="w-14 h-14 object-cover mx-auto rounded mt-2 cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-3 text-blue-600 hover:underline cursor-pointer"
                                    
                                        onClick={() => navigate(`/course-videos/${course.id}`)}
                                    >
                                        {course.title}
                                    </td>
                                    <td>{course.description}</td>
                                    <td>₹{course.price}</td>
                                    <td>
                                        {course.isPublished ? (
                                            <span className="text-green-600 font-semibold">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="text-red-600 font-semibold">
                                                Deactive
                                            </span>
                                        )}
                                    </td>

                                    <td className="flex justify-center gap-3 p-2">
                                        <button
                                            onClick={() => handlePublish(course.id, course.isPublished ?? false)}
                                            title="Publish Course"
                                            disabled={course.isPublished}
                                            className="p-2"
                                        >
                                            <Megaphone
                                                size={18}
                                                className={
                                                    course.isPublished
                                                        ? "text-gray-400"
                                                        : "text-green-600 hover:text-green-700"
                                                }
                                            />
                                        </button>

                                        <button
                                            onClick={() => handleEditClick(course)}
                                            title="Edit Course"
                                            className="p-2 hover:bg-blue-100 rounded">
                                            <Edit2 className="text-blue-600"
                                                size={18} />
                                        </button>

                                        <button
                                            onClick={() => handleDeleteCourse(course.id)}
                                            title="Delete Course"
                                            className="p-2 hover:bg-red-100 rounded">
                                            <Trash2 className="text-red-600" size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create MODAL */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setShowModal(false)}   // ✅ OUTSIDE CLICK CLOSE
                >
                    <div
                        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6"
                        onClick={(e) => e.stopPropagation()} // ✅ STOP INSIDE CLICK
                    >

                        {/* HEADER */}
                        <div className="flex justify-between items-center border-b pb-3 mb-5">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Create Course
                            </h2>

                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-black text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* FORM */}
                        <div className="space-y-5">

                            {/* TITLE */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Course Title
                                </label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter course title"
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* DESCRIPTION */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter course description"
                                    className="w-full border rounded-lg px-3 py-2 h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* PRICE */}
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (₹)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="Enter price"
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div> */}

                            {/* IMAGE UPLOAD */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Image
                                </label>

                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition">

                                    <span className="text-gray-500 text-sm">
                                        Click to upload image
                                    </span>

                                    <input
                                        type="file"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>

                                {/* FILE NAME */}
                                {formData.image && (
                                    <p className="text-green-600 text-sm mt-2">
                                        Selected: {formData.image.name}
                                    </p>
                                )}

                                {/* PREVIEW */}
                                {formData.image && (
                                    <img
                                        src={URL.createObjectURL(formData.image)}
                                        className="mt-3 w-24 h-24 object-cover rounded-lg border"
                                    />
                                )}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleCreateCourse}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Create Course
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Edit MODAL */}
            {showEditModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setShowEditModal(false)} // outside click close
                >
                    <div
                        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6"
                        onClick={(e) => e.stopPropagation()} // stop inside click
                    >

                        {/* HEADER */}
                        <div className="flex justify-between items-center border-b pb-3 mb-5">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Edit Course
                            </h2>

                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-500 hover:text-black text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* FORM */}
                        <div className="space-y-5">

                            {/* TITLE */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Course Title
                                </label>
                                <input
                                    value={editFormData.title}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* DESCRIPTION */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={editFormData.description}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* PRICE */}
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (₹)
                                </label>
                                <input
                                    type="number"
                                    value={editFormData.price}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            price: Number(e.target.value),
                                        })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div> */}

                            {/* IMAGE UPLOAD */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Image
                                </label>

                                {/* upload box */}
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition">

                                    <span className="text-gray-500 text-sm">
                                        Click here to upload image
                                    </span>

                                    <input
                                        type="file"
                                        onChange={(e) =>
                                            setEditFormData({
                                                ...editFormData,
                                                image: e.target.files?.[0] || null,
                                            })
                                        }
                                        className="hidden"
                                    />
                                </label>

                                {/* NEW IMAGE PREVIEW */}
                                {editFormData.image && (
                                    <>
                                        <p className="text-green-600 text-sm mt-2">
                                            Selected: {editFormData.image.name}
                                        </p>

                                        <img
                                            src={URL.createObjectURL(editFormData.image)}
                                            className="mt-3 w-24 h-24 object-cover rounded border"
                                        />
                                    </>
                                )}

                                {/* EXISTING IMAGE (if no new image selected) */}
                                {!editFormData.image && existingImage && (
                                    <img
                                        src={new URL(
                                            `../assets/${existingImage}`,
                                            import.meta.url
                                        ).href}
                                        className="mt-3 w-24 h-24 object-cover rounded border"
                                    />
                                )}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpdateCourse}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Update Course
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}