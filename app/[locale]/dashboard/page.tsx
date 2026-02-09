'use client';

import { useEffect, useState } from 'react';
import { studentApi } from '@/lib/api/student';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Trophy, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function StudentDashboard() {
    const [courses, setCourses] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [coursesData, certsData] = await Promise.all([
                    studentApi.getMyCourses(),
                    studentApi.getMyCertificates()
                ]);
                setCourses(coursesData);
                setCertificates(certsData);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#1e40af]" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-[#1e40af]">My Learning</h1>
                <p className="text-slate-500">Welcome back! Here is your progress.</p>
            </header>

            <section className="space-y-4">
                <div className="flex items-center gap-2 text-xl font-semibold text-[#1e40af]">
                    <BookOpen className="h-6 w-6" />
                    <h2>Enrolled Courses</h2>
                </div>

                {courses.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-12 text-center text-slate-500">
                        You Haven&apos;t enrolled in any courses yet.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Link key={course.id} href={`/courses/${course.slug}`}>
                                <div className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md dark:bg-slate-900">
                                    <div className="aspect-video w-full overflow-hidden bg-slate-100">
                                        <div className="flex h-full items-center justify-center text-slate-300">
                                            <BookOpen className="h-12 w-12" />
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg leading-tight group-hover:text-[#1e40af] transition-colors line-clamp-2">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 italic">By {course.instructorName}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span>Progress</span>
                                                <span className="text-[#f59e0b]">{course.progressPercentage}%</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#1e40af] to-[#3b82f6] transition-all duration-500"
                                                    style={{ width: `${course.progressPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2 text-xl font-semibold text-[#1e40af]">
                    <Trophy className="h-6 w-6" />
                    <h2>Certificates</h2>
                </div>

                {certificates.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-12 text-center text-slate-500">
                        Complete courses to earn certificates!
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="flex items-center gap-4 p-4 rounded-xl border bg-white dark:bg-slate-900">
                                <div className="p-3 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b]">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-medium text-sm truncate">{cert.course.title}</h4>
                                    <p className="text-xs text-slate-500">Issued on {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
