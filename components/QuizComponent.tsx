'use client';

import { useState, useEffect } from 'react';
import { studentApi, type Quiz, type QuizQuestion } from '@/lib/api/student';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function QuizComponent({ assetId, onComplete }: { assetId: string, onComplete?: () => void }) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ questionId: string, answerId: string }[]>([]);
    const [result, setResult] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setIsLoading(true);
                const data = await studentApi.getQuiz(assetId);
                setQuiz(data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load quiz');
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuiz();
    }, [assetId]);

    const handleAnswerSelect = (answerId: string) => {
        const questionId = quiz!.questions[currentQuestionIndex].id;
        const newAnswers = [...answers.filter(a => a.questionId !== questionId), { questionId, answerId }];
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz!.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (answers.length < quiz!.questions.length) {
            toast.error('Please answer all questions before submitting');
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await studentApi.submitQuiz(assetId, answers);
            setResult(res);
            if (res.passed) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#1e40af', '#f59e0b', '#ffffff']
                });
                if (onComplete) {
                    onComplete();
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit quiz');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetQuiz = () => {
        setResult(null);
        setCurrentQuestionIndex(0);
        setAnswers([]);
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-[#1e40af]" /></div>;
    if (!quiz) return <div className="text-center p-12 text-slate-500">Quiz not found</div>;

    if (result) {
        return (
            <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-500 max-w-lg mx-auto p-8 rounded-3xl bg-white/50 backdrop-blur-sm shadow-xl border border-white/20">
                <div className={`p-4 rounded-full ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {result.passed ? <CheckCircle2 className="h-16 w-16" /> : <XCircle className="h-16 w-16" />}
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-[#1e40af]">{result.passed ? 'Congratulations!' : 'Keep Practicing!'}</h2>
                    <p className="text-slate-500 text-lg">You scored <span className="font-bold text-[#f59e0b]">{result.score}%</span> (Passing: {result.passingScore}%)</p>
                </div>
                <div className="flex gap-4 w-full">
                    {!result.passed && (
                        <Button variant="outline" onClick={resetQuiz} className="flex-1 py-6 rounded-xl border-2 gap-2">
                            <RotateCcw className="h-5 w-5" /> Try Again
                        </Button>
                    )}
                    {result.passed && (
                        <Button className="flex-1 py-6 rounded-xl bg-[#1e40af] hover:bg-[#1e40af]/90 shadow-lg shadow-blue-200 gap-2">
                            Return to Lessons <ChevronRight className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedAnswerId = answers.find(a => a.questionId === currentQuestion.id)?.answerId;

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-[#1e40af]">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                    <span className="text-slate-400">{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1e40af] to-[#f59e0b] transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }} />
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-[#1e40af] leading-snug">{currentQuestion.text}</h3>
                <div className="grid gap-3">
                    {currentQuestion.answers.map((answer) => (
                        <button
                            key={answer.id}
                            onClick={() => handleAnswerSelect(answer.id)}
                            className={`flex items-center p-5 rounded-xl border-2 text-left transition-all ${selectedAnswerId === answer.id
                                    ? 'border-[#1e40af] bg-blue-50/50 shadow-sm'
                                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <div className={`h-6 w-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${selectedAnswerId === answer.id
                                    ? 'border-[#1e40af] bg-[#1e40af]'
                                    : 'border-slate-300'
                                }`}>
                                {selectedAnswerId === answer.id && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            <span className={`text-lg transition-all ${selectedAnswerId === answer.id ? 'font-semibold text-[#1e40af]' : 'text-slate-700'}`}>
                                {answer.text}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleNext}
                    disabled={!selectedAnswerId || isSubmitting}
                    className="bg-[#1e40af] hover:bg-[#1e40af]/90 min-w-[160px] text-lg py-7 rounded-2xl shadow-lg shadow-blue-100"
                >
                    {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                </Button>
            </div>
        </div>
    );
}
