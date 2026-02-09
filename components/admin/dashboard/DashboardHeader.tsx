'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

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

        // Animate count up
        const duration = 2000;
        const steps = 60;
        const stepValue = totalRevenue / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += stepValue;
            if (current >= totalRevenue) {
                setDisplayRevenue(totalRevenue);
                clearInterval(timer);
            } else {
                setDisplayRevenue(current);
            }
        }, duration / steps);

        return () => clearInterval(timer);
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
                    <div className="text-4xl font-black text-amber-400 font-mono tracking-tight flex items-baseline gap-1">
                        <span className="text-2xl text-amber-400/80">$</span>
                        {displayRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                </div>
            </div>
        </div>
    );
}
