import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../API_Service/apiService";
import toast from "react-hot-toast";

interface Exam {
    id: number;
    title: string;
}

interface Option {
    text: string;
    isCorrect: boolean;
}

interface QuestionForm {
    text: string;
    options: Option[];
}

export default function SetQuestionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = sessionStorage.getItem("accessToken");

    const [exam, setExam] = useState<Exam | null>(null);

    const [questions, setQuestions] = useState<QuestionForm[]>([
        {
            text: "",
            options: [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
            ],
        },
    ]);

    // ================= FETCH EXAM =================
    const fetchExam = async () => {
        try {
            const res = await API.get("/teacher/tec/getallexam", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const found = res.data.data.find(
                (e: Exam) => e.id === Number(id)
            );

            setExam(found);
        } catch {
            toast.error("Failed to fetch exam");
        }
    };

    useEffect(() => {
        fetchExam();
    }, []);

    // ================= ADD QUESTION =================
    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                text: "",
                options: [
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false },
                ],
            },
        ]);
    };

    // ================= HANDLE QUESTION =================
    const handleQuestionChange = (qIndex: number, value: string) => {
        const updated = [...questions];
        updated[qIndex].text = value;
        setQuestions(updated);
    };

    // ================= HANDLE OPTION =================
    const handleOptionChange = (
        qIndex: number,
        oIndex: number,
        value: string
    ) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex].text = value;
        setQuestions(updated);
    };

    // ================= SELECT CORRECT =================
    const handleCorrectSelect = (qIndex: number, oIndex: number) => {
        const updated = [...questions];

        updated[qIndex].options.forEach((opt, index) => {
            opt.isCorrect = index === oIndex;
        });

        setQuestions(updated);
    };

    // ================= SUBMIT =================
    const handleSubmit = async () => {
        try {
            // ✅ VALIDATION
            for (let q of questions) {
                if (!q.text) return toast.error("Question required");

                const hasCorrect = q.options.some((o) => o.isCorrect);
                if (!hasCorrect) return toast.error("Select correct answer");

                const empty = q.options.some((o) => !o.text);
                if (empty) return toast.error("Fill all options");
            }

            // ✅ STEP 1: CREATE QUESTIONS
            await API.post(
                `/teacher/tec/setquestion/${id}`,
                { text: questions.map((q) => q.text) },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // ✅ STEP 2: FETCH ALL QUESTIONS
            const res = await API.get(`/teacher/tec/getquestion/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const allQuestions = res.data.data;

            // ✅ STEP 3: GET LAST N QUESTIONS (IMPORTANT LOGIC)
            const newQuestions = allQuestions.slice(-questions.length);

            // ✅ STEP 4: CREATE OPTIONS
            for (let i = 0; i < newQuestions.length; i++) {
                await API.post(
                    `/teacher/tec/setoption`,
                    {
                        questionId: newQuestions[i].id,
                        options: questions[i].options,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            }

            toast.success("Questions & options created successfully");

            setTimeout(() => {
                navigate("/question");
            }, 1000);

        } catch (error) {
            console.error("FINAL ERROR 👉", error);
            toast.error("Error creating questions");
        }
    };
    return (
        <div className="p-6">
            {/* HEADER */}
            <h1 className="text-2xl font-bold mb-4">
                Set Questions for: {exam?.title || "Loading..."}
            </h1>

            {/* QUESTIONS */}
            {questions.map((q, qIndex) => (
                <div
                    key={qIndex}
                    className="mb-6 p-4 border rounded bg-white shadow"
                >
                    {/* QUESTION */}
                    <input
                        type="text"
                        placeholder={`Question ${qIndex + 1}`}
                        value={q.text}
                        onChange={(e) =>
                            handleQuestionChange(qIndex, e.target.value)
                        }
                        className="w-full mb-3 p-2 border rounded"
                    />

                    {/* OPTIONS */}
                    {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2 mb-2">
                            <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={opt.isCorrect}
                                onChange={() => handleCorrectSelect(qIndex, oIndex)}
                            />

                            <input
                                type="text"
                                placeholder={`Option ${oIndex + 1}`}
                                value={opt.text}
                                onChange={(e) =>
                                    handleOptionChange(qIndex, oIndex, e.target.value)
                                }
                                className="flex-1 p-2 border rounded"
                            />
                        </div>
                    ))}
                </div>
            ))}

            {/* ADD QUESTION */}
            <button
                onClick={addQuestion}
                className="mb-4 bg-gray-200 px-4 py-2 rounded"
            >
                + Add Question
            </button>

            {/* SUBMIT */}
            <div>
                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-6 py-2 rounded"
                >
                    Submit Questions
                </button>
            </div>
        </div>
    );
}