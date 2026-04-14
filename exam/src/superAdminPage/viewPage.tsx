import { useEffect, useState } from "react";
import API from "../API_Service/apiService";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

interface Question {
    id: number;
    text: string;
}

interface Option {
    id: number;
    text: string;
    isCorrect: boolean;
}

export default function ViewQuestionPage() {
    const { id } = useParams();
    const token = sessionStorage.getItem("accessToken");

    const [questions, setQuestions] = useState<Question[]>([]);
    const [optionsMap, setOptionsMap] = useState<Record<number, Option[]>>({});
    const [loading, setLoading] = useState(true);

    // ================= FETCH QUESTIONS + OPTIONS =================
    const fetchQuestions = async () => {
        try {
            // ✅ GET QUESTIONS
            const res = await API.get(`/teacher/tec/getquestion/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const questionList: Question[] = res.data.data;
            setQuestions(questionList);

            // ✅ GET OPTIONS (SAFE MAPPING)
            const optionPromises = questionList.map(async (q: Question) => {
                try {
                    const optionRes = await API.get(
                        `/teacher/tec/getoption/${q.id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    return {
                        questionId: q.id,
                        options: optionRes.data.data,
                    };
                } catch (err) {
                    console.error("Option fetch failed for question:", q.id);
                    return {
                        questionId: q.id,
                        options: [],
                    };
                }
            });

            const optionResults = await Promise.all(optionPromises);

            const map: Record<number, Option[]> = {};

            optionResults.forEach((item) => {
                map[item.questionId] = item.options;
            });

            setOptionsMap(map);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load questions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    // ================= LOADING =================
    if (loading) {
        return (
            <div className="p-6 text-center text-lg font-semibold">
                Loading questions...
            </div>
        );
    }

    // ================= UI =================
    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Questions</h1>

            {questions.length === 0 ? (
                <div className="text-center text-gray-500">
                    No Questions Found
                </div>
            ) : (
                questions.map((q, index) => (
                    <div
                        key={q.id}
                        className="mb-6 p-4 border rounded bg-white shadow"
                    >
                        {/* QUESTION */}
                        <h2 className="font-semibold mb-2">
                            Q{index + 1}. {q.text}
                        </h2>

                        {/* OPTIONS */}
                        <ul className="space-y-2">
                            {optionsMap[q.id]?.length > 0 ? (
                                optionsMap[q.id].map((opt, i) => (
                                    <li
                                        key={opt.id}
                                        className={`p-2 rounded flex justify-between ${opt.isCorrect
                                                ? "bg-green-100 text-green-700 font-semibold"
                                                : "bg-gray-100"
                                            }`}
                                    >
                                        <span>
                                            {String.fromCharCode(65 + i)}. {opt.text}
                                        </span>

                                        {opt.isCorrect && (
                                            <span className="text-green-600 font-bold">
                                                ✔ Correct
                                            </span>
                                        )}
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-400">No options found</li>
                            )}
                        </ul>
                    </div>
                ))
            )}
        </div>
    );
}