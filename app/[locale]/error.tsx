'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logger.error('Unhandled runtime error', { digest: error.digest }, error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold">Something went wrong!</h2>
            <p className="text-muted-foreground">{error.message}</p>
            <Button onClick={() => reset()}>Try again</Button>
        </div>
    );
}

