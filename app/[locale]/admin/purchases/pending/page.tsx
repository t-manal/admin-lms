'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { adminPurchasesApi, PendingPurchase } from '@/lib/api/adminPurchases';
// Removing financeApi usage to prevent Instructor endpoint confusion
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle, User, Book, Landmark, CreditCard, Copy, Hash, History, Download, Edit2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';

export default function PendingPurchasesPage() {
    const t = useTranslations('admin.purchases');
    const queryClient = useQueryClient();
    
    // State for Payment Modal (New Requests)
    const [selectedEnrollment, setSelectedEnrollment] = useState<PendingPurchase | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // State for History Edit Modal
    // We reuse PendingPurchase type because Ledger endpoint returns same shape
    const [editingEnrollment, setEditingEnrollment] = useState<PendingPurchase | null>(null);
    const [editAmount, setEditAmount] = useState<string>('');
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // State for "Add Manual Payment" to existing enrollment
    const [isAddMode, setIsAddMode] = useState(false);

    // Fetch Pending (New Requests)
    const { data: purchases, isLoading, isError, refetch } = useQuery({
        queryKey: ['admin', 'purchases', 'pending'],
        queryFn: () => adminPurchasesApi.getPending()
    });

    // Fetch Ledger (History/Active)
    const { data: ledger, isLoading: isLoadingLedger } = useQuery({
        queryKey: ['admin', 'purchases', 'ledger'],
        queryFn: () => adminPurchasesApi.getLedger(),
    });

    // Fetch Revenue Summary (Admin View)
    const { data: revenueSummary } = useQuery({
        queryKey: ['admin', 'revenue', 'summary'],
        queryFn: () => adminPurchasesApi.getRevenueSummary(),
    });

    // Mutation: Mark Paid (Partial/Full)
    const markPaidMutation = useMutation({
        mutationFn: ({ id, amount }: { id: string, amount: number }) => adminPurchasesApi.markPaid(id, amount),
        onSuccess: () => {
            toast.success('Payment recorded');
            setIsPaymentModalOpen(false);
            setPaymentAmount('');
            setSelectedEnrollment(null);
            queryClient.invalidateQueries({ queryKey: ['admin', 'purchases'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'revenue'] });
        },
        onError: (error: any) => {
            console.error('Mark Paid Error:', error);
            // Show backend error message if available
            toast.error(error.response?.data?.message || t('error'));
        }
    });

    // Mutation: Update Payment (History Edit)
    const updatePaymentMutation = useMutation({
        mutationFn: ({ id, amount }: { id: string, amount: number }) => adminPurchasesApi.updatePayment(id, amount),
        onSuccess: () => {
            toast.success('Payment updated');
            setIsEditModalOpen(false);
            setEditAmount('');
            setEditingEnrollment(null);
            setSelectedPaymentId(null);
            setIsAddMode(false);
            queryClient.invalidateQueries({ queryKey: ['admin', 'purchases'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'revenue'] });
        },
        onError: (error: any) => {
            console.error('Update Payment Error:', error);
            toast.error(error.response?.data?.message || 'Failed to update payment');
        }
    });

    const handleConfirmPayment = () => {
        if (!selectedEnrollment) return;
        const amount = parseFloat(paymentAmount);
        const isZeroPrice = selectedEnrollment.ledger.price === 0;

        if (isNaN(amount)) {
             toast.error('Please enter a valid amount');
             return;
        }

        if (isZeroPrice) {
            if (amount > 0) {
                toast.error('Zero-priced courses cannot accept payments > 0');
                return;
            }
        } else {
            if (amount <= 0) {
                 toast.error('Please enter a valid amount');
                 return;
            }
        }
        
        // Frontend Check for Price Cap (UX only, backend enforces strictly)
        if (amount > selectedEnrollment.ledger.remaining) {
            toast.error(`Amount exceeds remaining balance (${selectedEnrollment.ledger.remaining})`);
            return;
        }

        markPaidMutation.mutate({ id: selectedEnrollment.id, amount });
    };

    const handleUpdatePayment = () => {
        if (!selectedPaymentId) return;
        const amount = parseFloat(editAmount);
        const isZeroPrice = editingEnrollment?.ledger.price === 0;

        if (isNaN(amount)) {
             toast.error('Please enter a valid amount');
             return;
        }

        if (isZeroPrice) {
            if (amount > 0) {
                toast.error('Zero-priced courses cannot accept payments > 0');
                return;
            }
        } else {
            if (amount <= 0) {
                 toast.error('Please enter a valid amount');
                 return;
            }
        }
        updatePaymentMutation.mutate({ id: selectedPaymentId, amount });
    };

    const handleAddPayment = () => {
        if (!editingEnrollment) return;
        const amount = parseFloat(editAmount);
        const isZeroPrice = editingEnrollment?.ledger.price === 0;

        if (isNaN(amount)) {
            toast.error('Please enter a valid amount');
            return;
       }

       if (isZeroPrice) {
           if (amount > 0) {
               toast.error('Zero-priced courses cannot accept payments > 0');
               return;
           }
       } else {
           if (amount <= 0) {
                toast.error('Please enter a valid amount');
                return;
           }
       }
        // Use markPaid for adding NEW payment to existing enrollment
        markPaidMutation.mutate({ id: editingEnrollment.id, amount });
        setIsEditModalOpen(false); // Close the edit/manage dialog
    };

    const handleExport = async () => {
        try {
            const blob = await adminPurchasesApi.exportHistory();
            const url = window.URL.createObjectURL(new Blob([blob as any]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payments_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export Error:', error);
            toast.error('Failed to export history');
        }
    };

    // Calculate Summary Metrics
    const totalReceived = revenueSummary?.total || 0;
    const totalOutstanding = revenueSummary?.outstanding || 0;
    const pendingCount = purchases?.length || 0;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium animate-pulse">{t('loading') || 'Loading requests...'}</p>
            </div>
        );
    }

    if (isError) {
        return (
            <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <div className="text-center">
                        <CardTitle className="text-destructive">Error Loading Data</CardTitle>
                        <CardDescription>Failed to fetch pending purchases. Please try again.</CardDescription>
                    </div>
                    <Button onClick={() => refetch()} variant="outline">Retry</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Export */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={handleExport} variant="outline" className="gap-2 font-bold rounded-xl border-border hover:bg-muted/50">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                    <div className="flex items-center gap-3 bg-white/5 p-1 rounded-2xl border border-white/5">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-xl font-bold">
                            {pendingCount} {t('pending') || 'Requests'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('totalReceived')}</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(totalReceived)}</div>
                        <p className="text-xs text-muted-foreground">{t('totalReceivedDesc')}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('outstanding')}</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(totalOutstanding)}</div>
                        <p className="text-xs text-muted-foreground">{t('outstandingDesc')}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('pendingRequests')}</CardTitle>
                        <CreditCard className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">{t('pendingRequestsDesc')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Table */}
            <Card className="border-border bg-card shadow-sm rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-border bg-muted/20 px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-xl">
                            <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-bold">{t('pendingManualPayments')}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent border-border">
                                <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-start">{t('student')}</TableHead>
                                <TableHead className="py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-start">{t('course')}</TableHead>
                                <TableHead className="py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-start">Price</TableHead>
                                <TableHead className="py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-start">Remaining</TableHead>
                                <TableHead className="py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-start">{t('date')}</TableHead>
                                <TableHead className="px-8 py-5 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">{t('actions') || 'Actions'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchases?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center bg-muted/10">
                                        <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                                            <CreditCard className="h-12 w-12 mb-2 opacity-50" />
                                            <p className="font-bold text-lg">{t('noPending')}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                purchases?.map((p: PendingPurchase) => (
                                    <TableRow key={p.id} className="group border-border hover:bg-muted/30 transition-colors">
                                        <TableCell className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform">
                                                    <User className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold group-hover:text-primary transition-colors">
                                                        {p.user.firstName} {p.user.lastName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-medium">{p.user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <div className="flex items-center gap-2">
                                                <Book className="h-4 w-4 text-primary/60" />
                                                <span className="font-semibold">{p.course.title}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Badge variant="outline" className="text-[10px] bg-muted/50 border-border">
                                                    {p.course.university?.name || 'Unknown'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 font-medium">{formatPrice(p.ledger?.price ?? 0)}</TableCell>
                                        <TableCell className="py-5 font-bold text-amber-600">{formatPrice(p.ledger?.remaining ?? 0)}</TableCell>
                                        <TableCell className="py-5 text-muted-foreground font-medium text-xs">
                                            {format(new Date(p.enrolledAt), 'MMM d, yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell className="px-8 py-5 text-right">
                                            <Button 
                                                onClick={() => {
                                                    setSelectedEnrollment(p);
                                                    setPaymentAmount(p.ledger?.remaining?.toString() || '');
                                                    setIsPaymentModalOpen(true);
                                                }}
                                                className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>{t('confirmPayment')}</span>
                                                </div>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Previous Payments (Ledger) Table */}
            <Card className="border-border bg-card shadow-sm rounded-[2rem] overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                <CardHeader className="border-b border-border bg-muted/20 px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <History className="h-5 w-5 text-primary/70" />
                        </div>
                        <CardTitle className="text-xl font-bold">{t('previousPayments') || 'All Enrollments'}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent border-border">
                                <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-start">{t('student')}</TableHead>
                                <TableHead className="py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-start">{t('course')}</TableHead>
                                <TableHead className="py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-start">Price</TableHead>
                                <TableHead className="py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-start">Paid</TableHead>
                                <TableHead className="py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-start">Remaining</TableHead>
                                <TableHead className="py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-start">Status</TableHead>
                                <TableHead className="px-8 py-5 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">{t('actions') || 'Actions'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingLedger ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : (!ledger || ledger.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-48 text-center bg-muted/10">
                                        <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                                            <History className="h-12 w-12 mb-2 opacity-50" />
                                            <p className="font-bold text-lg">{t('noPreviousPayments')}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ledger.map((enr: PendingPurchase) => (
                                    <TableRow key={enr.id} className="group border-border hover:bg-muted/30 transition-colors">
                                        <TableCell className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/5 group-hover:scale-110 transition-transform">
                                                    <User className="h-5 w-5 text-primary/70" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold group-hover:text-primary transition-colors">
                                                        {enr.user.firstName} {enr.user.lastName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-medium">{enr.user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <div className="flex items-center gap-2">
                                                <Book className="h-4 w-4 text-primary/60" />
                                                <span className="font-semibold">{enr.course.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 font-medium text-muted-foreground">
                                            {formatPrice(enr.ledger.price)}
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <span className="font-bold text-emerald-600">
                                                {formatPrice(enr.ledger.paidAmount)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <span className="font-bold text-amber-600">
                                                {formatPrice(enr.ledger.remaining)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <Badge variant={enr.ledger.remaining === 0 ? "default" : (enr.ledger.paidAmount > 0 ? "secondary" : "outline")}>
                                                {enr.ledger.remaining === 0 ? "Fully Paid" : (enr.ledger.paidAmount > 0 ? "Partial" : "Unpaid")}
                                            </Badge>
                                             {enr.ledger.paidAmount > 0 && <Badge className="ml-2 bg-green-500/10 text-green-600 border-green-200">Active</Badge>} 
                                        </TableCell>
                                        <TableCell className="px-8 py-5 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingEnrollment(enr);
                                                    setIsAddMode(true); 
                                                    setEditAmount(enr.ledger.remaining.toString());
                                                    setIsEditModalOpen(true);
                                                }}
                                            >
                                                Manage
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Payment Modal (New Requests) */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('confirmTitle') || 'Confirm Payment'}</DialogTitle>
                        <DialogDescription>
                            Enter the amount paid by the student.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="col-span-3"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                            Remaining: {formatPrice(selectedEnrollment?.ledger.remaining ?? 0)}
                        </div>
                        {selectedEnrollment?.ledger.price === 0 && (
                            <div className="col-span-4 text-center p-2 bg-blue-50 text-blue-700 text-xs rounded-lg mt-2 font-medium">
                                This is a free course (\u20C1 0). Confirm with \u20C1 0 to grant access.
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
                        <Button 
                            onClick={handleConfirmPayment} 
                            disabled={markPaidMutation.isPending}
                        >
                            {markPaidMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage/Edit Modal (Ledger) */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Manage Payments</DialogTitle>
                        <DialogDescription>
                             History for {editingEnrollment?.course.title} ({editingEnrollment?.user.firstName} {editingEnrollment?.user.lastName})
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                             <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Price</p>
                                <p className="text-lg font-bold">{formatPrice(editingEnrollment?.ledger.price ?? 0)}</p>
                             </div>
                             <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Paid</p>
                                <p className="text-lg font-bold text-emerald-600">{formatPrice(editingEnrollment?.ledger.paidAmount ?? 0)}</p>
                             </div>
                             <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Remaining</p>
                                <p className="text-lg font-bold text-amber-600">{formatPrice(editingEnrollment?.ledger.remaining ?? 0)}</p>
                             </div>
                        </div>

                        {/* Recent Transactions List */}
                        <div>
                             <h4 className="text-sm font-bold mb-3">Transaction History</h4>
                             <div className="space-y-2 max-h-40 overflow-y-auto">
                                 {editingEnrollment?.paymentRecords?.map(p => (
                                     <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg bg-card text-sm">
                                         <div>
                                             <p className="font-bold">{formatPrice(Number(p.amount))}</p>
                                             <p className="text-xs text-muted-foreground">{format(new Date(p.createdAt), 'MMM d, yyyy')}</p>
                                         </div>
                                          <div>
                                              <Badge variant="outline" className="mr-2">{p.status}</Badge>
                                              {p.status === 'COMPLETED' && (
                                                <Button size="sm" variant="ghost" onClick={() => {
                                                    setIsAddMode(false);
                                                    setSelectedPaymentId(p.id);
                                                    setEditAmount(p.amount.toString());
                                                }}>Edit</Button>
                                              )}
                                          </div>
                                     </div>
                                 ))}
                             </div>
                        </div>

                        {/* Add/Edit Form */}
                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-bold mb-3">
                                {isAddMode ? 'Record New Payment' : 'Update Transaction'}
                            </h4>
                            {editingEnrollment?.ledger.price === 0 && (
                                <div className="text-center p-2 bg-blue-50 text-blue-700 text-xs rounded-lg mb-2 font-medium">
                                    Free Course: Only \u20C1 0 adjustments allowed.
                                </div>
                            )}
                            <div className="flex gap-3 items-end">
                                 <div className="grid gap-2 flex-1">
                                    <Label htmlFor="edit-amount">Amount</Label>
                                    <Input
                                        id="edit-amount"
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        placeholder="0.00"
                                    />
                                 </div>
                                 <Button 
                                     onClick={isAddMode ? handleAddPayment : handleUpdatePayment}
                                     disabled={updatePaymentMutation.isPending || markPaidMutation.isPending}
                                 >
                                     {(updatePaymentMutation.isPending || markPaidMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                     {isAddMode ? 'Add Payment' : 'Update Amount'}
                                 </Button>
                                 {!isAddMode && (
                                     <Button variant="ghost" onClick={() => {
                                         setIsAddMode(true);
                                         setEditAmount(editingEnrollment?.ledger.remaining.toString() || '');
                                         setSelectedPaymentId(null);
                                     }}>Cancel Edit</Button>
                                 )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

