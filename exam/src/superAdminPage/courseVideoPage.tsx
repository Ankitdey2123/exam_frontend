import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../API_Service/apiService";
import { ArrowLeft, Plus, Image } from "lucide-react";

interface Video {
    id: number;
    title: string;
    order: number;
    imageUrl?: string;
    description?: string;
}

interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    createdAt: string;
}

export default function CourseVideosPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showThumbModal, setShowThumbModal] = useState(false);
    const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
    const [thumbFile, setThumbFile] = useState<File | null>(null);

    const userType = sessionStorage.getItem("userType")?.toLowerCase();

    const [formData, setFormData] = useState({
        title: "",
        order: 1,
        file: null as File | null,
        thumbnail: null as File | null,
    });

    const getAuthHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    });

    // ---------------- COURSE ----------------
    const fetchCourse = async () => {
        try {
            const res = await API.get(`/super/v1/getcourse/${id}`, {
                headers: getAuthHeader(),
            });
            setCourse(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ---------------- VIDEOS ----------------
    const fetchVideos = async () => {
        try {
            const res = await API.get(`/super/v1/coursevideo/${id}`, {
                headers: getAuthHeader(),
            });
            setVideos(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCourse();
            fetchVideos();
        }
    }, [id]);

    // ---------------- UPLOAD ----------------
    const handleUpload = async () => {
        try {
            const data = new FormData();

            data.append("title", formData.title);
            data.append("order", String(formData.order));

            if (formData.file) {
                data.append("video", formData.file);
            }

            if (formData.thumbnail) {
                data.append("thumbnail", formData.thumbnail);
            }

            await API.post(
                `/super/v1/courses/${id}/videos`,
                data,
                {
                    headers: {
                        ...getAuthHeader(),
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setShowModal(false);
            setFormData({
                title: "",
                order: 1,
                file: null,
                thumbnail: null,
            });

            fetchVideos();
        } catch (err) {
            console.error(err);
        }
    };

    // ---------------- THUMBNAIL UPDATE ----------------
    const handleThumbnailUpload = async () => {
        if (!thumbFile || !selectedVideoId) return;

        try {
            const data = new FormData();
            data.append("image", thumbFile);

            await API.put(
                `/super/v1/thumbnail/${selectedVideoId}`,
                data,
                {
                    headers: {
                        ...getAuthHeader(),
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setShowThumbModal(false);
            setThumbFile(null);
            setSelectedVideoId(null);

            fetchVideos(); // refresh list
        } catch (err) {
            console.error(err);
        }
    };

    //get calculate the publish time
    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const createdDate = new Date(dateString);

        const diffMs = now.getTime() - createdDate.getTime();

        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (years > 0) {
            return `${years} year${years > 1 ? "s" : ""} ago`;
        }

        if (months > 0) {
            return `${months} month${months > 1 ? "s" : ""} ago`;
        }

        if (days > 0) {
            return `${days} day${days > 1 ? "s" : ""} ago`;
        }

        if (hours > 0) {
            return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        }

        if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        }

        return "just now";
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                >
                    <ArrowLeft size={30} />
                    <span className="font-medium">Back</span>
                </button>
            </div>

            {/* ================= COURSE HEADER ================= */}
            {course && (
                <div className="bg-white shadow-lg rounded-xl p-6 flex gap-6 items-center mb-6">

                    <img
                        src={new URL(`../assets/${course.imageUrl}`, import.meta.url).href}
                        className="w-32 h-32 object-cover rounded-lg border"
                    />

                    <div>
                        <h1 className="text-3xl font-bold">
                            {course.title}
                        </h1>

                        <p className="text-gray-600 mt-1">
                            {course.description}
                        </p>

                        {userType === "student" ? (
                            <p className="text-sm text-gray-500 mt-3">
                                Published{" "}
                                <span className="font-bold text-gray-700">
                                    {getTimeAgo(course.createdAt)}
                                </span>
                            </p>
                        ) : (
                            <p className="text-green-600 font-semibold mt-2 text-lg">
                                ₹ {course.price}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ================= TOP BAR ================= */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Course Videos</h2>

                {userType !== "student" && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        <Plus size={18} />
                        Upload Video
                    </button>
                )}
            </div>

            {/* ================= VIDEO LIST ================= */}
            <div className="grid md:grid-cols-2 gap-4">

                {videos.map((video) => (
                    <div
                        key={video.id}
                        className="bg-white rounded-xl shadow p-4"
                    >

                        {video.imageUrl && (
                            <img
                                src={new URL(`../assets/${video.imageUrl}`, import.meta.url).href}
                                className="w-full h-40 object-cover rounded-lg mb-3"
                            />
                        )}

                        <div className="flex items-center justify-between">

                            <h3 className="text-lg font-semibold">
                                {video.title}
                            </h3>

                            {userType !== "student" && (
                                <button
                                    onClick={() => {
                                        setSelectedVideoId(video.id);
                                        setShowThumbModal(true);
                                    }}
                                    className="p-2 rounded-full hover:bg-gray-200"
                                    title="Upload Thumbnail"
                                >
                                    <Image size={20} />
                                </button>
                            )}

                        </div>

                        {video.description && (
                            <p className="text-sm text-gray-600">
                                {video.description}
                            </p>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                            Order: {video.order}
                        </p>

                        <button
                            onClick={() =>
                                navigate(`/course/video/play/${video.id}`)
                            }
                            className="mt-3 text-blue-600 font-medium"
                        >
                            ▶ Play Video
                        </button>
                    </div>
                ))}

            </div>

            {/* ================= UPLOAD MODAL ================= */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    onClick={() => setShowModal(false)}
                >
                    {/* MODAL CONTAINER */}
                    <div
                        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* ================= HEADER ================= */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold">Upload Course Video</h2>
                                <p className="text-sm text-blue-100">
                                    Add new learning content to this course
                                </p>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="text-white text-xl hover:opacity-80"
                            >
                                ✕
                            </button>
                        </div>

                        {/* ================= BODY (SCROLLABLE) ================= */}
                        <div className="p-6 space-y-6 overflow-y-auto">

                            {/* VIDEO TITLE */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Video Title
                                </label>
                                <input
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    placeholder="Enter video title"
                                    className="w-full mt-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* ORDER */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Video Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            order: Number(e.target.value),
                                        })
                                    }
                                    placeholder="Enter display order"
                                    className="w-full mt-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Controls the order of video in playlist
                                </p>
                            </div>

                            {/* VIDEO UPLOAD */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Video File
                                </label>

                                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition bg-gray-50">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        id="videoUpload"
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                file: e.target.files?.[0] || null,
                                            })
                                        }
                                    />

                                    <label
                                        htmlFor="videoUpload"
                                        className="cursor-pointer text-gray-600"
                                    >
                                        <p className="font-medium">
                                            Click to upload video
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            MP4, MOV, AVI supported
                                        </p>
                                    </label>

                                    {formData.file && (
                                        <div className="mt-3 text-green-600 text-sm">
                                            Selected: {formData.file.name}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* THUMBNAIL UPLOAD */}
                            {/* <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Thumbnail Image (Optional)
                                </label>

                                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition bg-gray-50">

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="thumbUpload"
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                thumbnail: e.target.files?.[0] || null,
                                            })
                                        }
                                    />

                                    <label
                                        htmlFor="thumbUpload"
                                        className="cursor-pointer text-gray-600"
                                    >
                                        <p className="font-medium">
                                            Click to upload thumbnail
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            JPG, PNG recommended
                                        </p>
                                    </label>

                                    {formData.thumbnail && (
                                        <div className="mt-3 flex items-center justify-center gap-3">
                                            <img
                                                src={URL.createObjectURL(formData.thumbnail)}
                                                className="w-20 h-14 object-cover rounded border"
                                            />
                                            <span className="text-green-600 text-sm">
                                                {formData.thumbnail.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div> */}
                        </div>

                        {/* ================= FOOTER ================= */}
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">

                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpload}
                                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 shadow"
                            >
                                Upload Video
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*THUMBNAIL UPLOAD MODAL*/}
            {showThumbModal && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    onClick={() => setShowThumbModal(false)}
                >
                    <div
                        className="bg-white w-full max-w-md rounded-xl shadow-lg p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4">
                            Upload Thumbnail
                        </h2>

                        {/* Upload Box */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="thumbOnlyUpload"
                                onChange={(e) =>
                                    setThumbFile(e.target.files?.[0] || null)
                                }
                            />

                            <label
                                htmlFor="thumbOnlyUpload"
                                className="cursor-pointer text-gray-600"
                            >
                                Click to select image
                            </label>

                            {thumbFile && (
                                <div className="mt-3">
                                    <img
                                        src={URL.createObjectURL(thumbFile)}
                                        className="w-24 h-16 object-cover mx-auto rounded border"
                                    />
                                    <p className="text-sm text-green-600 mt-2">
                                        {thumbFile.name}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-5">
                            <button
                                onClick={() => setShowThumbModal(false)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleThumbnailUpload}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}