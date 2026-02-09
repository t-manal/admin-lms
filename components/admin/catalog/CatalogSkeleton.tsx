'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CatalogCardSkeleton() {
    return (
        <Card className="overflow-hidden border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl">
            <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                        <Skeleton className="h-12 w-12 rounded-xl dark:bg-slate-800" />
                        <Skeleton className="h-5 w-16 rounded-lg dark:bg-slate-800" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-5 w-3/4 rounded-md dark:bg-slate-800" />
                        <Skeleton className="h-4 w-1/2 rounded-md dark:bg-slate-800" />
                    </div>
                </div>
                <div className="mt-4 flex justify-end border-t border-slate-100 dark:border-white/5 pt-3">
                    <Skeleton className="h-8 w-20 rounded-lg dark:bg-slate-800" />
                </div>
            </CardContent>
        </Card>

    );
}
