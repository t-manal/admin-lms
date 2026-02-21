'use client';

import { useState, useEffect } from 'react';
import { financeApi, type PaymentRecord } from '@/lib/api/finance';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Banknote, TrendingUp, Users, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice, withLatinDigits } from '@/lib/utils';

export default function MarketingPage() {
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalSales: 0,
        activeStudents: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await financeApi.getPayments({ limit: 100 });
                const paymentList = data.payments || [];
                setPayments(paymentList);

                // Calculate some stats from the fetched payments (since we don't have a dedicated stats endpoint yet)
                const totalRevenue = paymentList
                    .filter(p => p.status === 'COMPLETED')
                    .reduce((sum, p) => sum + p.amount, 0);

                const uniqueStudents = new Set(paymentList.map(p => p.user.email)).size;

                setStats({
                    totalRevenue,
                    totalSales: paymentList.filter(p => p.status === 'COMPLETED').length,
                    activeStudents: uniqueStudents
                });
            } catch (error) {
                toast.error('Failed to load financial data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
                <p className="text-muted-foreground">Track your earnings and monitor recent transactions.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSales}</div>
                        <p className="text-xs text-muted-foreground">+12 since last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeStudents}</div>
                        <p className="text-xs text-muted-foreground">+48 this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{payments.length}</div>
                        <p className="text-xs text-muted-foreground">Across all courses</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>A list of the latest payments from your students.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                <div className="font-medium">{payment.user.firstName} {payment.user.lastName}</div>
                                                <div className="text-xs text-muted-foreground">{payment.user.email}</div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">{payment.course.title}</TableCell>
                                            <TableCell className="font-bold">
                                                {formatPrice(payment.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(payment.status)}>
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(payment.createdAt).toLocaleDateString(withLatinDigits())}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
