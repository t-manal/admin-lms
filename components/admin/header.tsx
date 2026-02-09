'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, Menu, Bell, Search, Settings } from 'lucide-react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ModeToggle } from './ModeToggle';
import Link from 'next/link';
import { NotificationsDropdown } from './notifications-dropdown';

interface AdminHeaderProps {
    onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { user, logout } = useAuth();
    const t = useTranslations('admin.header');
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const currentLocale = params.locale as string;

    const handleLanguageChange = (newLocale: string) => {
        const segments = pathname.split('/');
        if (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'ar')) {
            segments[1] = newLocale;
            router.push(segments.join('/'));
        } else {
            router.push(`/${newLocale}/admin`);
        }
    };

    return (
        <header className="flex h-20 items-center justify-between px-6 lg:px-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 sticky top-0 z-40 shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-white/5" onClick={onMenuClick}>
                    <Menu className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </Button>

                <div className="hidden md:flex relative items-center group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors rtl:left-auto rtl:right-3" />
                    <Input
                        placeholder={t('search_placeholder')}
                        className="h-10 w-64 ps-10 rtl:pe-10 rounded-xl bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all font-medium text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
                <div className="hidden sm:flex items-center gap-1">
                    <ModeToggle />
                    <NotificationsDropdown />
                    <Link href={`/${currentLocale}/admin/settings`}>
                        <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:text-primary hover:bg-primary/5 transition-all">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-xl font-bold gap-2 px-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                            <Languages className="h-4 w-4" />
                            <span className="uppercase text-xs tracking-widest">{currentLocale}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[150px]">
                        <DropdownMenuItem
                            onClick={() => handleLanguageChange('en')}
                            className={cn("rounded-xl cursor-pointer font-semibold", currentLocale === 'en' && "bg-primary/5 text-primary")}
                        >
                            English
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleLanguageChange('ar')}
                            className={cn("rounded-xl cursor-pointer font-semibold", currentLocale === 'ar' && "bg-primary/5 text-primary")}
                        >
                            العربية
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-11 px-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border-2 border-white shadow-md">
                                    <AvatarImage src="" alt={user?.username || 'Admin'} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{user?.firstName?.[0] || 'A'}</AvatarFallback>
                                </Avatar>
                                <div className="hidden lg:flex flex-col items-start leading-none gap-1.5">
                                    <span className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</span>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t('administrator')}</span>
                                </div>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 rounded-[1.5rem] border-none shadow-2xl p-2 mt-2" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal p-3">
                            <div className="flex flex-col space-y-2">
                                <p className="text-sm font-bold leading-none text-slate-900">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs leading-none text-slate-500 font-medium">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="my-1 bg-slate-100" />
                        <DropdownMenuItem className="rounded-xl cursor-pointer font-semibold py-2.5 hover:bg-slate-50" onClick={() => router.push(`/${currentLocale}/admin/settings?tab=profile`)}>
                            {t('profile')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl cursor-pointer font-semibold py-2.5 hover:bg-slate-50" onClick={() => router.push(`/${currentLocale}/admin/settings?tab=security`)}>
                            {t('account_settings')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-slate-100" />
                        <DropdownMenuItem
                            onClick={() => logout()}
                            className="rounded-xl cursor-pointer font-bold py-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        >
                            {t('logout')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

