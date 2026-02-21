'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronRight, LayoutGrid, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CatalogCardProps {
    title: string;
    description?: string;
    tag?: string;
    image?: string;
    count?: number | string;
    countLabel?: string;
    onManage?: () => void;
    onDelete?: () => void;
    isDeleting?: boolean;
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
    onDelete,
    isDeleting = false,
    icon
}: CatalogCardProps) {
    const tCommon = useTranslations('common');

    return (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-slate-200/50 dark:border-white/5 group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md hover:-translate-y-0.5 rounded-xl">
            <CardContent className="p-3">
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between">
                        <Avatar className="h-9 w-9 rounded-lg border-2 border-white dark:border-slate-800 shadow-md transition-transform duration-500 group-hover:scale-110">
                            {image ? (
                                <AvatarImage src={image} alt={title} className="object-cover" />
                            ) : (
                                <AvatarFallback className="bg-primary/5 text-primary">
                                    {icon || <LayoutGrid className="h-4 w-4" />}
                                </AvatarFallback>
                            )}
                        </Avatar>

                        {count !== undefined && (
                            <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30 font-bold uppercase text-[8px] tracking-tight px-1.5 py-0 rounded-md shadow-sm">
                                {count} {countLabel}
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-1">
                        {tag && (
                            <span className="text-[8px] font-bold text-primary/70 uppercase tracking-wider px-1.5 py-0.5 bg-primary/5 rounded border border-primary/5 inline-block">
                                {tag}
                            </span>
                        )}
                        <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                            {title}
                        </h3>
                        {description && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 font-medium leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-2.5 flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-white/5 pt-2">
                    {onDelete && (
                        <Button
                            onClick={onDelete}
                            variant="ghost"
                            size="sm"
                            disabled={isDeleting}
                            className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 font-bold transition-all px-2 text-[10px] uppercase tracking-wider"
                        >
                            <Trash2 className="me-1 h-3 w-3" />
                            {isDeleting ? tCommon('loading') : tCommon('delete')}
                        </Button>
                    )}
                    <Button
                        onClick={onManage}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-primary hover:text-primary hover:bg-primary/5 font-bold transition-all group-hover:pe-1.5 pe-3 text-[10px] uppercase tracking-wider"
                    >
                        {tCommon('manage')}
                        <ChevronRight className="ms-1 h-3 w-3 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                    </Button>
                </div>
            </CardContent>
        </Card>


    );
}
