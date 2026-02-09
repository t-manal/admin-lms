import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
            <p className="text-muted-foreground">The page you are looking for does not exist.</p>
            <Button asChild>
                <Link href="/">Go Home</Link>
            </Button>
        </div>
    );
}
