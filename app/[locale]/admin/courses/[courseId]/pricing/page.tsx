'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { instructorApi, type Course } from '@/lib/api/instructor';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CoursePricingPage() {
    const t = useTranslations('admin.courses.pricing');
    const params = useParams();
    const courseId = params.courseId as string;
    const [price, setPrice] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data = await instructorApi.getCourse(courseId);
                setPrice(data.price);
                setIsLoading(false);
            } catch (error) {
                toast.error('Failed to load pricing');
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await instructorApi.updateCourse(courseId, { price });
            toast.success('Pricing updated');
        } catch (error) {
            toast.error('Failed to update pricing');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Loader2 className="animate-spin" />;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t('title')}</h2>
            <Card>
                <CardHeader>
                    <CardTitle>{t('cardTitle')}</CardTitle>
                    <CardDescription>{t('cardDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex bg-muted rounded-md p-4 items-center">
                        <span className="text-2xl font-bold mr-2">{'\u20C1'}</span>
                        <Input
                            type="number"
                            value={price}
                            onChange={e => setPrice(Number(e.target.value))}
                            className="text-xl h-12"
                            min={0}
                        />
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('save')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
