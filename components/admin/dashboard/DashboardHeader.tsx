'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface DashboardHeaderProps {
    totalRevenue: number;
    userName?: string;
}

export function DashboardHeader({ totalRevenue, userName = "Admin" }: DashboardHeaderProps) {
    const t = useTranslations('admin.dashboard');
    const [greeting, setGreeting] = useState('');
    const [displayRevenue, setDisplayRevenue] = useState(0);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('GoodMorning');
        else if (hour < 18) setGreeting('GoodAfternoon');
        else setGreeting('GoodEvening');

        // Smoother requestAnimationFrame counter to avoid jumpy glyph rendering.
        const duration = 1400;
        const startValue = 0;
        const startTime = performance.now();
        let frameId = 0;

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const nextValue = startValue + (totalRevenue - startValue) * eased;
            setDisplayRevenue(Math.round(nextValue));

            if (progress < 1) {
                frameId = requestAnimationFrame(animate);
            } else {
                setDisplayRevenue(totalRevenue);
            }
        };

        frameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frameId);
    }, [totalRevenue]);

    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-blue-900 via-primary to-indigo-900 p-8 md:p-12 shadow-2xl group">
            {/* Abstract Shapes/Glows */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 mix-blend-overlay animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/20 rounded-full blur-3xl -ml-20 -mb-20 mix-blend-overlay"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/80 font-bold uppercase tracking-widest text-xs mb-2">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span>{t('commandCenter', { defaultMessage: 'Command Center' })}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                        {t((greeting || 'welcome') as any, { defaultMessage: 'Welcome back' })}, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                            {userName}
                        </span>
                    </h1>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 min-w-[200px]">
                    <span className="block text-slate-300 text-xs font-bold uppercase tracking-widest mb-1">
                        {t('totalRevenue', { defaultMessage: 'Total Revenue' })}
                    </span>
                    <div dir="ltr" className="text-4xl font-black text-amber-400 tabular-nums tracking-tight">
                        {formatPrice(displayRevenue)}
                    </div>
                </div>
            </div>
        </div>
    );
}
