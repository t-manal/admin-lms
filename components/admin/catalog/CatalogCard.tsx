'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CatalogCardProps {
    title: string;
    description?: string;
    tag?: string;
    image?: string;
    count?: number | string;
    countLabel?: string;
    onManage?: () => void;
    icon?: React.ReactNode;
}

export function CatalogCard({
    title,
    description,
    tag,
    image,
    count,
    countLabel,
    onManage,
    icon
}: CatalogCardProps) {
    const tCommon = useTranslations('common');

    return (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-slate-200/50 dark:border-white/5 group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md hover:-translate-y-1 rounded-2xl">
            <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                        <Avatar className="h-12 w-12 rounded-xl border-2 border-white dark:border-slate-800 shadow-lg transition-transform duration-500 group-hover:scale-110">
                            {image ? (
                                <AvatarImage src={image} alt={title} className="object-cover" />
                            ) : (
                                <AvatarFallback className="bg-primary/5 text-primary">
                                    {icon || <LayoutGrid className="h-6 w-6" />}
                                </AvatarFallback>
                            )}
                        </Avatar>

                        {count !== undefined && (
                            <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30 font-bold uppercase text-[9px] tracking-tight px-2 py-0.5 rounded-lg shadow-sm">
                                {count} {countLabel}
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        {tag && (
                            <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider px-1.5 py-0.5 bg-primary/5 rounded border border-primary/5 inline-block">
                                {tag}
                            </span>
                        )}
                        <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                            {title}
                        </h3>
                        {description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-medium leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-slate-100 dark:border-white/5 pt-3">
                    <Button
                        onClick={onManage}
                        variant="ghost"
                        size="sm"
                        className="h-8 text-primary hover:text-primary hover:bg-primary/5 font-bold transition-all group-hover:pe-2 pe-4 text-xs uppercase tracking-wider"
                    >
                        {tCommon('manage')}
                        <ChevronRight className="ms-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                    </Button>
                </div>
            </CardContent>
        </Card>


    );
}
