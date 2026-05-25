import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../API_Service/apiService";
import toast from "react-hot-toast";
import { Clock3 } from "lucide-react";

interface Option {
    id: number;
    text: string;
}

interface Question {
    id: number;
    text: string;
    options: Option[];
}

interface ExamData {
    id: number;
    title: string;
    duration: number;
    totalMarks: number;
    questions: Question[];
}

interface Answer {
    questionId: number;
    selectedOptionId: number;
}

export default function StudentExamQuestionPage() {

    const { examId } = useParams();

    const navigate = useNavigate();

    const [exam, setExam] = useState<ExamData | null>(null);

    const [timeLeft, setTimeLeft] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [answers, setAnswers] = useState<Answer[]>([]);

    const warningShown = useRef(false);

    const autoSubmitted = useRef(false);

    const getAuthHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    });

    // ================= FETCH QUESTIONS =================
    const fetchQuestions = async () => {

        try {

            const res = await API.get(
                `/student/stu/question/${examId}`,
                {
                    headers: getAuthHeader(),
                }
            );

            setExam(res.data.data);

            // duration is in minutes
            setTimeLeft(res.data.data.duration * 60);

        } catch (err) {

            console.error(err);

            toast.error("Failed to load exam");
        }
    };

    useEffect(() => {

        if (examId) {
            fetchQuestions();
        }

    }, [examId]);

    // ================= TIMER =================
    useEffect(() => {

        if (!exam) return;

        // AUTO SUBMIT
        if (timeLeft <= 0 && !autoSubmitted.current) {

            autoSubmitted.current = true;

            toast.error(
                "Time is over! Auto submitting exam..."
            );

            handleSubmit(true);

            return;
        }

        // 1 MIN WARNING
        if (
            timeLeft === 60 &&
            !warningShown.current
        ) {

            warningShown.current = true;

            toast.error(
                "Hurry up! Exam time is 1 minute left"
            );
        }

        const timer = setInterval(() => {

            setTimeLeft((prev) => prev - 1);

        }, 1000);

        return () => clearInterval(timer);

    }, [timeLeft, exam]);

    // ================= FORMAT TIMER =================
    const formatTime = (seconds: number) => {

        const mins = Math.floor(seconds / 60);

        const secs = seconds % 60;

        return `${String(mins).padStart(2, "0")}:${String(
            secs
        ).padStart(2, "0")}`;
    };

    // ================= SELECT OPTION =================
    const handleSelectOption = (
        questionId: number,
        optionId: number
    ) => {

        setAnswers((prev) => {

            const filtered = prev.filter(
                (ans) => ans.questionId !== questionId
            );

            return [
                ...filtered,
                {
                    questionId,
                    selectedOptionId: optionId,
                },
            ];
        });
    };

    // ================= SUBMIT EXAM =================
    const handleSubmit = async (
        isAutoSubmit = false
    ) => {

        // prevent multiple submit
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {

            // prevent empty submit
            if (answers.length === 0) {

                toast.error(
                    "Please answer at least one question"
                );

                setIsSubmitting(false);

                return;
            }

            // FIXED PAYLOAD
            const payload = {

                examId: Number(examId),

                answers: answers.map((ans) => ({
                    questionId: ans.questionId,
                    optionId: ans.selectedOptionId,
                })),
            };

            const res=await API.post(
                "/student/stu/attempt-test",
                payload,
                {
                    headers: getAuthHeader(),
                }
            );

            toast.success(
                isAutoSubmit
                    ? "Time over! Exam auto submitted"
                    : "Exam submitted successfully"
            );

            navigate(`/stu-result/${examId}`);

        } catch (err: any) {

            console.error(err);

            if (
                err?.response?.data?.message?.includes(
                    "You already attempted this exam"
                )
            ) {

                toast.error(
                    "You already attempted this exam"
                );

            } else {

                toast.error(
                    "Failed to submit exam"
                );
            }

        } finally {

            setIsSubmitting(false);
        }
    };

    // ================= LOADING =================
    if (!exam) {

        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
                Loading Exam...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* ================= HEADER ================= */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex justify-between items-center">

                <div>

                    <h1 className="text-3xl font-bold text-gray-800">
                        {exam.title}
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Total Marks:{" "}
                        <span className="font-semibold">
                            {exam.totalMarks}
                        </span>
                    </p>
                </div>

                {/* TIMER */}
                <div className="bg-red-100 text-red-600 px-5 py-3 rounded-xl flex items-center gap-3">

                    <Clock3 size={24} />

                    <span className="text-2xl font-bold">
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

            {/* ================= QUESTIONS ================= */}
            <div className="space-y-6">

                {exam.questions.map(
                    (question, index) => (

                        <div
                            key={question.id}
                            className="bg-white rounded-2xl shadow-md p-6"
                        >

                            {/* QUESTION */}
                            <h2 className="text-xl font-semibold text-gray-800 mb-5">

                                Q{index + 1}.{" "}
                                {question.text}
                            </h2>

                            {/* OPTIONS */}
                            <div className="space-y-4">

                                {question.options.map(
                                    (option) => {

                                        const selected =
                                            answers.find(
                                                (ans) =>
                                                    ans.questionId ===
                                                        question.id &&
                                                    ans.selectedOptionId ===
                                                        option.id
                                            );

                                        return (
                                            <label
                                                key={option.id}
                                                className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${
                                                    selected
                                                        ? "border-blue-600 bg-blue-50"
                                                        : "border-gray-200 hover:border-blue-400"
                                                }`}
                                            >

                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    checked={
                                                        !!selected
                                                    }
                                                    onChange={() =>
                                                        handleSelectOption(
                                                            question.id,
                                                            option.id
                                                        )
                                                    }
                                                />

                                                <span className="text-gray-700 font-medium">
                                                    {option.text}
                                                </span>
                                            </label>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* ================= SUBMIT ================= */}
            <div className="mt-8 flex justify-end">

                <button
                    onClick={() =>
                        handleSubmit(false)
                    }
                    disabled={isSubmitting}
                    className={`px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg transition ${
                        isSubmitting
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                >
                    {isSubmitting
                        ? "Submitting..."
                        : "Submit Exam"}
                </button>
            </div>
        </div>
    );
}