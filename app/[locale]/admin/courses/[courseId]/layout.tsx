'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpen, Users, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';

import { useTranslations } from 'next-intl';



export default function CourseLayout({ children }: { children: ReactNode }) {
    const t = useTranslations('admin.courses.tabs');
    const params = useParams();
    const pathname = usePathname();
    // Ensure we have the locale in path if needed, but Link handles it usually if using next-intl Link.
    // But here we use next/link. Next.js App Router handles relative links well but absolute paths need locale.
    // We are using absolute paths like `/admin/courses/...`. 
    // We should probably rely on `useLocale` to construct the path correctly or use `next-intl/link` if available/configured.
    // However, the provided code uses standard paths. I will assume the middleware handles locale or I should prepend it.
    // Typically in app/[locale], the current path includes locale.

    // Better way: use relative paths or construct based on current path?
    // Let's use string manipulation to respect current locale.

    const locale = pathname.split('/')[1];
    const courseId = params.courseId as string;
    const baseUrl = `/${locale}/admin/courses/${courseId}`;

    const navItems = [
        { label: t('overview'), href: `${baseUrl}`, icon: LayoutDashboard, exact: true },
        { label: t('curriculum'), href: `${baseUrl}/curriculum`, icon: BookOpen },
        { label: t('pricing'), href: `${baseUrl}/pricing`, icon: DollarSign },
        { label: t('students'), href: `${baseUrl}/students`, icon: Users },
    ];

    return (
        <div className="flex flex-col gap-6 md:flex-row">
            <aside className="w-full md:w-64 shrink-0">
                <Card className="p-4 sticky top-6">
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => {
                            const isActive = item.exact
                                ? pathname === item.href
                                : pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </Card>
            </aside>
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
}
