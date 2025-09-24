import type { EmailRecipient, User } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

type RecipientWithUser = EmailRecipient & { user: { name: string | null, email: string | null } };

interface RecipientStatusTableProps {
    recipients: RecipientWithUser[];
}

const statusConfig = {
    PENDING: { variant: 'secondary', Icon: Clock, className: 'bg-amber-100 text-amber-800' },
    SUCCESS: { variant: 'default', Icon: CheckCircle, className: 'bg-green-100 text-green-800' },
    FAILED: { variant: 'destructive', Icon: XCircle, className: 'bg-red-100 text-red-800' },
};

export function RecipientStatusTable({ recipients }: RecipientStatusTableProps) {
    return (
        <ScrollArea className="h-96">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recipients.map(recipient => {
                        const config = statusConfig[recipient.status];
                        return (
                            <TableRow key={recipient.id}>
                                <TableCell>
                                    <p className="font-medium">{recipient.user.name}</p>
                                    <p className="text-xs text-muted-foreground">{recipient.user.email}</p>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={config.className}>
                                        <config.Icon className="h-3 w-3 mr-1" />
                                        {recipient.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </ScrollArea>
    );
}
