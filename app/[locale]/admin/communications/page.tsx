'use client';

import { useState, useEffect } from 'react';
import { instructorApi } from '@/lib/api/instructor';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { withLatinDigits } from '@/lib/utils';

export default function CommunicationsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const fetchTickets = async () => {
        try {
            setIsLoading(true);
            const data = await instructorApi.getSupportTickets();
            setTickets(data);
        } catch (error) {
            toast.error('Failed to load support tickets');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleOpenTicket = async (ticket: any) => {
        try {
            const data = await instructorApi.getSupportTicket(ticket.id);
            setSelectedTicket(data);
        } catch (error) {
            toast.error('Failed to load ticket details');
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedTicket) return;
        try {
            setIsSending(true);
            await instructorApi.sendTicketMessage(selectedTicket.id, message);
            toast.success('Message sent');
            setMessage('');
            // Refresh ticket details
            handleOpenTicket(selectedTicket);
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleUpdateStatus = async (status: 'OPEN' | 'PENDING' | 'CLOSED') => {
        if (!selectedTicket) return;
        try {
            await instructorApi.updateTicketStatus(selectedTicket.id, status);
            toast.success('Status updated');
            handleOpenTicket(selectedTicket);
            fetchTickets();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Communications & Support</h1>
                <p className="text-muted-foreground">Respond to student support tickets and inquiries.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No support tickets found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>
                                            <div className="font-medium">{ticket.user?.firstName} {ticket.user?.lastName}</div>
                                            <div className="text-xs text-muted-foreground">{ticket.user?.email}</div>
                                        </TableCell>
                                        <TableCell>{ticket.subject}</TableCell>
                                        <TableCell>
                                            <Badge variant={ticket.status === 'CLOSED' ? 'secondary' : 'default'}>
                                                {ticket.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(ticket.updatedAt).toLocaleDateString(withLatinDigits())}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="outline" onClick={() => handleOpenTicket(ticket)}>
                                                <MessageCircle className="h-4 w-4 mr-2" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
                <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{selectedTicket?.subject}</DialogTitle>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{selectedTicket?.status}</Badge>
                            <span className="text-xs text-muted-foreground">Ticket ID: {selectedTicket?.id}</span>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
                        {selectedTicket?.messages?.map((msg: any) => (
                            <div key={msg.id} className={`flex flex-col ${msg.senderId === selectedTicket.instructorId ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 ${msg.senderId === selectedTicket.instructorId ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1">
                                    {new Date(msg.createdAt).toLocaleString(withLatinDigits())}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <Textarea
                            placeholder="Type your response..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            disabled={selectedTicket?.status === 'CLOSED'}
                        />
                        <div className="flex justify-between items-center">
                            <div className="space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus('PENDING')} disabled={selectedTicket?.status === 'CLOSED'}>Mark Pending</Button>
                                <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleUpdateStatus('CLOSED')} disabled={selectedTicket?.status === 'CLOSED'}>Close Ticket</Button>
                            </div>
                            <Button onClick={handleSendMessage} disabled={isSending || !message.trim() || selectedTicket?.status === 'CLOSED'}>
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Message'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
