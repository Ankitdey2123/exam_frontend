import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import API from "../API_Service/apiService";
import { ArrowLeft } from "lucide-react";

interface ResultData {
    id: number;
    userId: number;
    examId: number;
    score: number;

    exam: {
        id: number;
        title: string;
        totalMarks: number;
    };
}

export default function StudentExamResultPage() {

    const navigate = useNavigate();

    const { examId } = useParams();

    const [resultData, setResultData] =
        useState<ResultData | null>(null);

    const [loading, setLoading] =
        useState(true);

    const getAuthHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem(
            "accessToken"
        )}`,
    });

    // ================= GET USER ID FROM TOKEN =================
    const getUserIdFromToken = () => {

        try {

            const token =
                sessionStorage.getItem("accessToken");

            if (!token) return null;

            // JWT FORMAT => header.payload.signature
            const payload = token.split(".")[1];

            // BASE64 DECODE
            const decodedPayload = JSON.parse(
                atob(payload)
            );

            // RETURN USER ID
            return (
                decodedPayload.userId ||
                decodedPayload.id ||
                decodedPayload.sub
            );

        } catch (err) {

            console.error(
                "Token decode failed",
                err
            );

            return null;
        }
    };

    // ================= FETCH RESULT =================
    const fetchResult = async () => {

        try {

            const userId =
                getUserIdFromToken();

            if (!userId || !examId) {
                return;
            }

            const res = await API.get(
                `/student/stu/result/${userId}/${examId}`,
                {
                    headers: getAuthHeader(),
                }
            );

            setResultData(res.data.data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchResult();

    }, []);

    // ================= LOADING =================
    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
                Loading Result...
            </div>
        );
    }

    // ================= NO RESULT =================
    if (!resultData) {

        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-red-600">
                Result Not Found
            </div>
        );
    }

    // ================= PASS / FAIL =================
    const isPass =
        resultData.score >=
        resultData.exam.totalMarks / 2;

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* ================= BACK ================= */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 mb-6"
            >
                <ArrowLeft size={24} />

                <span className="font-medium">
                    Back
                </span>
            </button>

            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">

                {/* TITLE */}
                <h1 className="text-4xl font-bold text-center mb-2">
                    Exam Result
                </h1>

                <p className="text-center text-gray-500">
                    {resultData.exam.title}
                </p>

                {/* SCORE */}
                <div className="mt-8 text-center">

                    <h2 className="text-lg text-gray-500">
                        Your Score
                    </h2>

                    <h1 className="text-6xl font-bold text-blue-600 mt-2">
                        {resultData.score}

                        <span className="text-3xl text-gray-400">
                            /{resultData.exam.totalMarks}
                        </span>
                    </h1>

                    <div className="mt-5">

                        {isPass ? (

                            <span className="bg-green-100 text-green-700 px-5 py-2 rounded-full font-bold">
                                PASS
                            </span>

                        ) : (

                            <span className="bg-red-100 text-red-700 px-5 py-2 rounded-full font-bold">
                                FAIL
                            </span>

                        )}
                    </div>
                </div>

                {/* BUTTON */}
                <div className="mt-10 text-center">

                    <button
                        onClick={() =>
                            navigate("/stu-exam")
                        }
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 mr-4"
                    >
                        Back To Exams
                    </button>

                    <button
                        onClick={() =>
                            navigate(`/stu-answer/${examId}`)
                        }
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
                    >
                        See Answers
                    </button>

                </div>
            </div>
        </div>
    );
}