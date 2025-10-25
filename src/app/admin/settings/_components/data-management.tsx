
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, DatabaseZap } from 'lucide-react';
import { seedDatabaseAction, cleanupDatabaseAction } from '@/app/actions/seed';

export function DataManagement() {
    const { toast } = useToast();

    const handleSeed = async () => {
        const result = await seedDatabaseAction();
        if (result.success) {
            toast({
                title: 'Database Seeded',
                description: result.success,
            });
        } else {
            toast({
                title: 'Error Seeding Database',
                description: result.error,
                variant: 'destructive',
            });
        }
    };
    
    const handleCleanup = async () => {
        const result = await cleanupDatabaseAction();
         if (result.success) {
            toast({
                title: 'Database Cleaned',
                description: result.success,
            });
        } else {
            toast({
                title: 'Error Cleaning Database',
                description: result.error,
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <ConfirmationCard
                title="Clean & Seed Database"
                description="This will completely wipe all data from your database and replace it with the initial seed data. All user accounts, posts, and settings will be reset."
                actionText="Clean & Seed Database"
                confirmationText="seed"
                onConfirm={handleSeed}
                Icon={DatabaseZap}
                variant="destructive"
            />
             <ConfirmationCard
                title="Cleanup Database"
                description="This will completely wipe all data from your database, leaving it empty. All user accounts, posts, and settings will be permanently deleted."
                actionText="Cleanup Database"
                confirmationText="cleanup"
                onConfirm={handleCleanup}
                Icon={Trash2}
                variant="destructive"
            />
        </div>
    );
}


interface ConfirmationCardProps {
    title: string;
    description: string;
    actionText: string;
    confirmationText: string;
    onConfirm: () => Promise<void>;
    Icon: React.ElementType;
    variant?: "default" | "destructive";
}

function ConfirmationCard({ title, description, actionText, confirmationText, onConfirm, Icon, variant }: ConfirmationCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleAction = () => {
        startTransition(async () => {
            await onConfirm();
            setIsOpen(false);
            setInputValue('');
        });
    };

    return (
        <Card className={variant === 'destructive' ? 'border-destructive' : ''}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className={variant === 'destructive' ? 'text-destructive' : ''} />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant={variant} className="w-full">
                            {actionText}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action is irreversible. To confirm, please type{" "}
                                <strong className="font-mono text-foreground">{confirmationText}</strong> below.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            autoFocus
                        />
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setInputValue('')}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleAction}
                                disabled={inputValue !== confirmationText || isPending}
                            >
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}
