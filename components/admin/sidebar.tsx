'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    Users,
    MessageSquare,
    BarChart,
    Settings,
    Library,
    University,
    Ticket,
    LogOut,
    ChevronRight,
    CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/contexts/auth-context';

const sidebarItems = [
    {
        titleKey: 'dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        titleKey: 'catalog',
        icon: Library,
        href: '/admin/catalog',
        submenu: [
            { titleKey: 'courses', href: '/admin/courses', icon: BookOpen },
            { titleKey: 'universities', href: '/admin/catalog/universities', icon: University },
        ]
    },
    // Courses tab removed - course management accessed via Universities (V2)
    {
        titleKey: 'students',
        href: '/admin/students',
        icon: Users,
    },
    {
        titleKey: 'purchases',
        href: '/admin/purchases/pending',
        icon: CreditCard,
    },
    // Analytics removed per V2 cleanup
    // {
    //     titleKey: 'analytics',
    //     href: '/admin/marketing',
    //     icon: BarChart,
    // },

    {
        titleKey: 'settings',
        href: '/admin/settings',
        icon: Settings,
    },
];

interface AdminSidebarProps {
    className?: string;
    onNavigate?: () => void;
}

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
    const pathname = usePathname();
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations('admin.sidebar');
    const { logout } = useAuth();

    return (
        <div className={cn("flex flex-col h-full bg-slate-950 text-white selection:bg-primary/30", className)}>
            <div className="flex items-center px-6 border-b border-white/5 h-20 shadow-lg shadow-black/20">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20">
                        <GraduationCap className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tight text-white leading-none">Manal</span>
                        <span className="text-[10px] font-bold text-primary tracking-widest uppercase mt-1">LMS Admin</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-8">
                <nav className="space-y-2 px-4">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        // Handle external links (WhatsApp) vs Internal
                        const isExternal = (item as any).isExternal;
                        const itemHref = isExternal ? item.href : `/${locale}${item.href}`;
                        
                        // Active state logic only applies to internal links
                        const isMainActive = !isExternal && (
                            pathname === itemHref || 
                            (item.href !== '/admin' && pathname.startsWith(itemHref))
                        );

                        if (item.submenu) {
                            const isSubActive = item.submenu.some(sub => pathname.startsWith(`/${locale}${sub.href}`));

                            return (
                                <div key={item.href} className="space-y-2">
                                    <div className={cn(
                                        "flex items-center px-4 py-3 text-sm font-bold transition-all rounded-2xl",
                                        isSubActive ? "text-white" : "text-white/40"
                                    )}>
                                        <Icon className={cn("me-3 h-5 w-5", isSubActive ? "text-primary" : "text-inherit")} />
                                        <span className="flex-1">{t(item.titleKey)}</span>
                                    </div>
                                    <div className="ms-6 me-2 space-y-1 border-s border-white/10 ps-4 rtl:ms-0 rtl:me-6 rtl:ps-0 rtl:pe-4 rtl:border-s-0 rtl:border-e">
                                        {item.submenu.map((sub) => {
                                            const subHref = `/${locale}${sub.href}`;
                                            const isActive = pathname.startsWith(subHref);
                                            return (
                                                <Link
                                                    key={sub.href}
                                                    href={subHref}
                                                    onClick={onNavigate}
                                                    className={cn(
                                                        "flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all group",
                                                        isActive
                                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                            : "text-white/40 hover:text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    <span className="flex-1">{t(sub.titleKey)}</span>
                                                    <ChevronRight className={cn(
                                                        "h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1",
                                                        isActive ? "opacity-100" : "opacity-0"
                                                    )} />
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        }

                        // External Link Rendering
                        if (isExternal) {
                             return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={onNavigate}
                                    className={cn(
                                        "flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all group text-white/40 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon className="h-5 w-5 me-3 transition-colors group-hover:text-primary" />
                                    <span className="flex-1">{t(item.titleKey)}</span>
                                </a>
                            )
                        }

                        // Internal Link Rendering
                        return (
                            <Link
                                key={item.href}
                                href={itemHref}
                                onClick={onNavigate}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all group",
                                    isMainActive
                                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                                        : "text-white/40 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon className={cn("h-5 w-5 me-3 transition-colors", isMainActive ? "text-white" : "group-hover:text-primary")} />
                                <span className="flex-1">{t(item.titleKey)}</span>
                                {isMainActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-6 border-t border-white/5">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-2xl h-12 font-bold px-4"
                    onClick={() => logout()}
                >
                    <LogOut className="h-5 w-5 me-3" />
                    <span>{t('logout')}</span>
                </Button>
            </div>
        </div>
    );
}

