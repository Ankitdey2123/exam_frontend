import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import API from "../API_Service/apiService";

import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
} from "lucide-react";

interface Option {
    id: number;
    text: string;
}

interface Answer {
    questionId: number;
    question: string;

    options: Option[];

    correctAnswer: {
        id: number;
        text: string;
    };

    userAnswer: {
        id: number;
        text: string;
        isCorrect: boolean;
    } | null;
}

export default function SeeStudentAnswerPage() {

    const navigate = useNavigate();

    const { examId } = useParams();

    const [answers, setAnswers] =
        useState<Answer[]>([]);

    const [loading, setLoading] =
        useState(true);

    const getAuthHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem(
            "accessToken"
        )}`,
    });

    // ================= FETCH ANSWERS =================
    const fetchAnswers = async () => {

        try {

            const res = await API.get(
                `/student/stu/answer/${examId}`,
                {
                    headers: getAuthHeader(),
                }
            );

            setAnswers(res.data.data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchAnswers();

    }, []);

    // ================= LOADING =================
    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
                Loading Answers...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* ================= HEADER ================= */}
            <div className="max-w-4xl mx-auto">

                <button
                    onClick={() =>
                        navigate(-1)
                    }
                    className="flex items-center gap-2 mb-6 text-gray-700 hover:text-blue-600"
                >
                    <ArrowLeft size={22} />

                    <span className="font-medium">
                        Back
                    </span>
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-8">

                    <h1 className="text-3xl font-bold text-gray-800">
                        Exam Answers
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Review your answers and
                        correct answers
                    </p>

                    {/* ================= QUESTIONS ================= */}
                    <div className="mt-8 space-y-6">

                        {answers.map(
                            (
                                answer,
                                index
                            ) => (

                                <div
                                    key={
                                        answer.questionId
                                    }
                                    className="border rounded-2xl p-6 bg-gray-50"
                                >

                                    {/* QUESTION */}
                                    <div className="flex items-start justify-between gap-4">

                                        <div>
                                            <h2 className="text-lg font-bold text-gray-800">
                                                Question{" "}
                                                {index + 1}
                                            </h2>

                                            <p className="mt-2 text-gray-700 text-lg">
                                                {
                                                    answer.question
                                                }
                                            </p>
                                        </div>

                                        {answer.userAnswer
                                            ?.isCorrect ? (

                                            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                                                <CheckCircle2 size={18} />

                                                Correct
                                            </div>

                                        ) : (

                                            <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
                                                <XCircle size={18} />

                                                Wrong
                                            </div>
                                        )}
                                    </div>

                                    {/* OPTIONS */}
                                    <div className="mt-6 space-y-3">

                                        {answer.options.map(
                                            (
                                                option
                                            ) => {

                                                const isCorrect =
                                                    option.id ===
                                                    answer
                                                        .correctAnswer
                                                        .id;

                                                const isUserAnswer =
                                                    option.id ===
                                                    answer
                                                        .userAnswer
                                                        ?.id;

                                                return (

                                                    <div
                                                        key={
                                                            option.id
                                                        }
                                                        className={`border rounded-xl p-4 transition ${isCorrect
                                                                ? "bg-green-100 border-green-400"
                                                                : isUserAnswer
                                                                    ? "bg-red-100 border-red-400"
                                                                    : "bg-white border-gray-200"
                                                            }`}
                                                    >

                                                        <div className="flex items-center justify-between">

                                                            <span className="font-medium text-gray-800">
                                                                {
                                                                    option.text
                                                                }
                                                            </span>

                                                            <div className="flex gap-2">

                                                                {isCorrect && (

                                                                    <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                                                        Correct
                                                                        Answer
                                                                    </span>
                                                                )}

                                                                {isUserAnswer && (

                                                                    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                                                        Your
                                                                        Answer
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>

                                    {/* NOT ANSWERED */}
                                    {!answer.userAnswer && (

                                        <div className="mt-5 bg-yellow-100 text-yellow-800 px-4 py-3 rounded-xl font-semibold">
                                            You did not answer
                                            this question
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>

                    {/* ================= EMPTY ================= */}
                    {answers.length === 0 && (

                        <div className="text-center mt-10">

                            <h2 className="text-2xl font-semibold text-gray-700">
                                No Answers Found
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Answers are not
                                available
                            </p>
                        </div>
                    )}

                    {/* ================= BUTTON ================= */}
                    <div className="mt-10 text-center">

                        <button
                            onClick={() =>
                                navigate(
                                    "/stu-exam"
                                )
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition"
                        >
                            Back To Exams
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}