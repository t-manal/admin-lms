'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useAuth } from '@/lib/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { isAdminPanelRole } from '@/lib/rbac';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    // Active Redirect for Access Control (Client-Side Fallback)
    useEffect(() => {
        if (!isLoading && (!user || !isAdminPanelRole(user.role))) {
            const pathSegments = window.location.pathname.split('/');
            const currentLocale = ['en', 'ar'].includes(pathSegments[1]) ? pathSegments[1] : 'en';
            router.push(`/${currentLocale}/login`);
        }
    }, [user, isLoading, router]);


    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // RBAC Guard: Only show redirect message if we are CERTAIN user is invalid (not loading, user is null OR wrong role)
    if (!isLoading && (!user || !isAdminPanelRole(user.role))) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Desktop Sidebar - Hidden on default (mobile), visible on lg */}
            <div className="hidden lg:block w-64 border-r bg-card border-border shrink-0">
                <AdminSidebar />
            </div>

            {/* Mobile Sidebar (Sheet) */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-64 border-r">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SheetDescription className="sr-only">Access admin dashboard links</SheetDescription>
                    <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/10">
                    {children}
                </main>
            </div>
        </div>
    );
}
