import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-white/40 p-12 shadow-2xl backdrop-blur-md dark:bg-black/40">
                <Loader2 className="h-12 w-12 animate-spin text-[#1e40af]" />
                <p className="animate-pulse text-lg font-medium text-slate-600 dark:text-slate-300">
                    Preparing your workspace...
                </p>
            </div>
        </div>
    );
}
