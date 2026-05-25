import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../API_Service/apiService";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Video {
    id: number;
    title: string;
    videoUrl: string;
    courseId: number; // ✅ REQUIRED (fix)
}

interface CourseVideo {
    id: number;
    title: string;
    order: number;
    imageUrl?: string;
}

export default function VideoPlayPage() {
    const { videoId } = useParams();
    const navigate = useNavigate();

    const [video, setVideo] = useState<Video | null>(null);
    const [videoList, setVideoList] = useState<CourseVideo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    //Comment Sections
    const [comments, setComments] = useState<
        { name: string; text: string }[]
    >([]);

    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        if (video?.id) {
            const saved = localStorage.getItem(`comments_${video.id}`);

            if (saved) {
                setComments(JSON.parse(saved));
            } else {
                // ✅ default static comments
                const defaultComments = [
                    { name: "Ankit", text: "Great explanation!" },
                    { name: "Rahul", text: "Very helpful video 👍" },
                ];
                setComments(defaultComments);
                localStorage.setItem(
                    `comments_${video.id}`,
                    JSON.stringify(defaultComments)
                );
            }
        }
    }, [video]);

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const updated = [
            ...comments,
            { name: "You", text: newComment },
        ];

        setComments(updated);

        localStorage.setItem(
            `comments_${video?.id}`,
            JSON.stringify(updated)
        );

        setNewComment("");
    };

    //get token from the session storage

    const getAuthHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    });

    // ---------------- FETCH SINGLE VIDEO ----------------
    const fetchVideo = async (id: string | number) => {
        try {
            setLoading(true);

            const res = await API.get(`/super/v1/videos/${id}`, {
                headers: getAuthHeader(),
            });

            const videoData: Video = res.data.data;

            // ✅ store current playing video
            setVideo(videoData);

            // ✅ ALWAYS get courseId from current video
            const currentCourseId = videoData.courseId;

            // ✅ fetch sidebar videos based on current playing video
            fetchCourseVideos(currentCourseId);

        } catch (err) {
            console.error("Error fetching video:", err);
        } finally {
            setLoading(false);
        }
    };

    // ---------------- FETCH COURSE VIDEOS ----------------
    const fetchCourseVideos = async (courseId: number) => {
        try {
            const res = await API.get(
                `/super/v1/coursevideo/${courseId}`,
                {
                    headers: getAuthHeader(),
                }
            );

            // ✅ sort videos by order
            const sorted = res.data.data.sort(
                (a: CourseVideo, b: CourseVideo) => a.order - b.order
            );

            setVideoList(sorted);
        } catch (err) {
            console.error("Error fetching course videos:", err);
        }
    };

    // ---------------- INITIAL LOAD ----------------
    useEffect(() => {
        if (videoId) {
            fetchVideo(videoId);
        }
    }, [videoId]);

    // ---------------- CLICK VIDEO ----------------
    const handleVideoClick = (id: number) => {
        if (id === video?.id) return; // ✅ prevent reload of same video
        fetchVideo(id); // ✅ loads new video + updates courseId automatically
    };

    return (
        <div className="min-h-screen bg-black text-white flex">

            {/* ---------------- LEFT SIDE (PLAYER) ---------------- */}
            <div className="flex-1 flex flex-col p-6 relative overflow-y-auto">
                <div className="w-full max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 bg--gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                </div>
                {loading && <p>Loading video...</p>}

                {!loading && video && (
                    <div className="w-full max-w-4xl">
                        <video
                            key={video.id} // ✅ ensures reload when video changes
                            controls
                            autoPlay
                            className="w-full rounded-lg shadow-lg bg-black"
                            src={video.videoUrl}
                        />

                        <h1 className="text-2xl font-semibold mt-4">
                            {video.title}
                        </h1>
                    </div>
                )}
                {/* ---------------- COMMENTS SECTION ---------------- */}
                <div className="mt-8">

                    <h2 className="text-xl font-semibold mb-4">
                        Comments
                    </h2>

                    {/* ADD COMMENT */}
                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 outline-none"
                        />

                        <button
                            onClick={handleAddComment}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                        >
                            Post
                        </button>
                    </div>

                    {/* COMMENT LIST */}
                    <div className="space-y-4">
                        {comments.map((c, index) => (
                            <div
                                key={index}
                                className="bg-gray-900 p-3 rounded"
                            >
                                <p className="text-sm font-semibold text-blue-400">
                                    {c.name}
                                </p>
                                <p className="text-gray-300 text-sm">
                                    {c.text}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>

                {!loading && !video && (
                    <p className="text-red-500">Video not found</p>
                )}
            </div>

            {/* ---------------- RIGHT SIDE (VIDEO LIST) ---------------- */}
            <div className="w-80 bg-gray-900 border-l border-gray-800 overflow-y-auto">

                <div className="p-4 border-b border-gray-700 font-semibold text-lg">
                    Course Videos
                </div>

                {videoList.map((item) => {
                    const isActive = item.id === video?.id;

                    return (
                        <div
                            key={item.id}
                            onClick={() => handleVideoClick(item.id)}
                            className={`p-4 cursor-pointer border-b border-gray-800 transition 
                                ${isActive
                                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                    : "hover:bg-gray-800"
                                }`}
                        >
                            <div className="flex items-center gap-3">

                                {/* Thumbnail */}
                                {item.imageUrl && (
                                    <img
                                        src={new URL(`../assets/${item.imageUrl}`, import.meta.url).href}
                                        className="w-16 h-10 object-cover rounded"
                                    />
                                )}

                                {/* Text */}
                                <div className="text-sm">
                                    <p className="font-medium">
                                        {item.order}. {item.title}
                                    </p>
                                </div>

                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}