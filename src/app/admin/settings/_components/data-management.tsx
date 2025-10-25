
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle, DatabaseZap, Trash2 } from 'lucide-react';
import { seedDatabaseAction, cleanupDatabaseAction } from '@/app/actions/seed';
import { AnimatePresence, motion } from 'framer-motion';

type ActionType = 'seed' | 'cleanup';
type Status = 'idle' | 'confirm' | 'cleaning' | 'seeding' | 'success' | 'error';

interface ActionState {
    status: Status;
    message: string | null;
}

export function DataManagement() {
    const { toast } = useToast();
    const [actionState, setActionState] = useState<ActionState>({ status: 'idle', message: null });
    const [isPending, startTransition] = useTransition();

    const handleAction = (type: ActionType) => {
        startTransition(async () => {
            setActionState({ status: 'cleaning', message: 'Cleaning up database...' });
            const cleanupResult = await cleanupDatabaseAction();

            if (cleanupResult.error) {
                setActionState({ status: 'error', message: cleanupResult.error });
                toast({ title: 'Cleanup Failed', description: cleanupResult.error, variant: 'destructive' });
                return;
            }

            if (type === 'cleanup') {
                setActionState({ status: 'success', message: 'Database cleaned successfully.' });
                toast({ title: 'Success!', description: 'Database has been cleaned.' });
            } else if (type === 'seed') {
                setActionState({ status: 'seeding', message: 'Seeding database...' });
                const seedResult = await seedDatabaseAction();
                if (seedResult.error) {
                    setActionState({ status: 'error', message: seedResult.error });
                    toast({ title: 'Seeding Failed', description: seedResult.error, variant: 'destructive' });
                } else {
                    setActionState({ status: 'success', message: seedResult.success });
                    toast({ title: 'Success!', description: 'Database has been seeded.' });
                }
            }

            setTimeout(() => {
                setActionState({ status: 'idle', message: null });
            }, 3000);
        });
    };

    const renderProgress = () => {
        const { status, message } = actionState;
        
        const iconMap = {
            cleaning: <Loader2 className="h-4 w-4 animate-spin" />,
            seeding: <Loader2 className="h-4 w-4 animate-spin" />,
            success: <CheckCircle className="h-4 w-4 text-green-500" />,
            error: <AlertTriangle className="h-4 w-4 text-destructive" />
        };

        return (
            <AnimatePresence>
                {status !== 'idle' && status !== 'confirm' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-3 border rounded-lg bg-muted/50 flex items-center gap-3 text-sm"
                    >
                        {iconMap[status]}
                        <span className={cn(status === 'error' ? 'text-destructive' : 'text-muted-foreground')}>{message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    return (
        <div className="space-y-6">
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DatabaseZap className="text-destructive" />
                        Clean & Seed Database
                    </CardTitle>
                    <CardDescription>
                        This will wipe all data and replace it with the initial seed data. All user accounts, posts, and settings will be reset.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={() => handleAction('seed')}
                        disabled={isPending}
                    >
                        {isPending && actionState.status !== 'idle' ? (
                            'Processing...'
                        ) : (
                            'Clean & Seed Database'
                        )}
                    </Button>
                    {renderProgress()}
                </CardContent>
            </Card>
             <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trash2 className="text-destructive" />
                        Cleanup Database
                    </CardTitle>
                    <CardDescription>
                        This will wipe all data, leaving the database empty. All user accounts, posts, and settings will be permanently deleted.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={() => handleAction('cleanup')}
                        disabled={isPending}
                    >
                        {isPending && actionState.status !== 'idle' ? (
                            'Processing...'
                        ) : (
                            'Cleanup Database'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
