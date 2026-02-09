'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { instructorApi } from '@/lib/api/instructor';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Save, Plus, Trash, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Answer {
    text: string;
    isCorrect: boolean;
}

interface Question {
    text: string;
    order: number;
    answers: Answer[];
}

export default function QuizEditorPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.quizId as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [passingScore, setPassingScore] = useState(70);
    const [questions, setQuestions] = useState<Question[]>([]);

    const fetchQuiz = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await instructorApi.getInstructorQuiz(quizId);
            setTitle(data.title);
            setPassingScore(data.passingScore);

            // Map backend questions to form state
            const mappedQuestions = data.questions.map((q: any) => ({
                text: q.text,
                order: q.order,
                answers: q.answers.map((a: any) => ({
                    text: a.text,
                    isCorrect: a.isCorrect
                }))
            }));

            setQuestions(mappedQuestions);
        } catch (error) {
            toast.error('Failed to load quiz');
        } finally {
            setIsLoading(false);
        }
    }, [quizId]);

    useEffect(() => {
        fetchQuiz();
    }, [fetchQuiz]);

    const handleSave = async () => {
        // Validation
        if (!title.trim()) {
            toast.error('Quiz title is required');
            return;
        }

        // Validate Questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim()) {
                toast.error(`Question ${i + 1} text is required`);
                return;
            }
            if (q.answers.length < 2) {
                toast.error(`Question ${i + 1} needs at least 2 answers`);
                return;
            }
            const correctCount = q.answers.filter(a => a.isCorrect).length;
            if (correctCount !== 1) {
                toast.error(`Question ${i + 1} must have exactly one correct answer`);
                return;
            }
            for (const a of q.answers) {
                if (!a.text.trim()) {
                    toast.error(`Question ${i + 1} has empty answers`);
                    return;
                }
            }
        }

        try {
            setIsSaving(true);
            // Re-assign orders based on array index
            const orderedQuestions = questions.map((q, idx) => ({
                ...q,
                order: idx + 1
            }));

            await instructorApi.updateQuiz(quizId, {
                title,
                passingScore,
                questions: orderedQuestions as any[]
            });
            toast.success('Quiz saved successfully');
        } catch (error) {
            toast.error('Failed to save quiz');
        } finally {
            setIsSaving(false);
        }
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                text: 'New Question',
                order: questions.length + 1,
                answers: [
                    { text: 'Option 1', isCorrect: true },
                    { text: 'Option 2', isCorrect: false }
                ]
            }
        ]);
    };

    const removeQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const updateQuestionText = (index: number, text: string) => {
        const newQuestions = [...questions];
        newQuestions[index].text = text;
        setQuestions(newQuestions);
    };

    const addAnswer = (qIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].answers.push({ text: 'New Option', isCorrect: false });
        setQuestions(newQuestions);
    };

    const removeAnswer = (qIndex: number, aIndex: number) => {
        const newQuestions = [...questions];
        if (newQuestions[qIndex].answers.length <= 2) {
            toast.error('Minimum 2 answers required');
            return;
        }
        newQuestions[qIndex].answers.splice(aIndex, 1);
        setQuestions(newQuestions);
    };

    const updateAnswerText = (qIndex: number, aIndex: number, text: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].answers[aIndex].text = text;
        setQuestions(newQuestions);
    };

    const setCorrectAnswer = (qIndex: number, aIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].answers.forEach((a, idx) => a.isCorrect = idx === aIndex);
        setQuestions(newQuestions);
    };

    if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container py-8 max-w-4xl space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Quiz Editor</h1>
                        <p className="text-muted-foreground">Edit questions and settings</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>Quiz Title</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Passing Score (%)</Label>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={passingScore}
                            onChange={e => setPassingScore(parseInt(e.target.value) || 0)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
                    <Button variant="outline" onClick={addQuestion}>
                        <Plus className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                </div>

                {questions.map((q, qIndex) => (
                    <Card key={qIndex} className="relative">
                        <CardHeader className="pb-2">
                            <div className="flex items-start gap-4">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                                    {qIndex + 1}
                                </div>
                                <div className="flex-1">
                                    <Input
                                        value={q.text}
                                        onChange={e => updateQuestionText(qIndex, e.target.value)}
                                        placeholder="Enter question text..."
                                        className="font-medium text-lg border-none shadow-none focus-visible:ring-0 px-0 h-auto"
                                    />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeQuestion(qIndex)}>
                                    <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pl-14 pt-0">
                            <div className="space-y-3 mt-2">
                                {q.answers.map((a, aIndex) => (
                                    <div key={aIndex} className="flex items-center gap-3">
                                        <button
                                            onClick={() => setCorrectAnswer(qIndex, aIndex)}
                                            className={`shrink-0 ${a.isCorrect ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'}`}
                                            title={a.isCorrect ? "Correct Answer" : "Mark as Correct"}
                                        >
                                            {a.isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                        </button>
                                        <Input
                                            value={a.text}
                                            onChange={e => updateAnswerText(qIndex, aIndex, e.target.value)}
                                            className={`flex-1 ${a.isCorrect ? 'border-green-200 bg-green-50' : ''}`}
                                            placeholder={`Option ${aIndex + 1}`}
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => removeAnswer(qIndex, aIndex)}>
                                            <Trash className="h-4 w-4 text-muted-foreground/50 hover:text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={() => addAnswer(qIndex)}>
                                    <Plus className="mr-2 h-3 w-3" /> Add Option
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
