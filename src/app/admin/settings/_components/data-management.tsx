
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseZap, Trash2 } from 'lucide-react';
import { ActionProgressModal } from './action-progress-modal';
import { ConfirmationDialog } from './confirmation-dialog';
import { seedDatabaseAction, cleanupDatabaseAction } from '@/app/actions/seed';
import { useToast } from '@/hooks/use-toast';

type ActionType = 'seed' | 'cleanup';
type Step = 'idle' | 'cleaning' | 'seeding' | 'success' | 'error';

export interface ProgressState {
  step: Step;
  message: string | null;
}

export function DataManagement() {
    const [progressState, setProgressState] = useState<ProgressState>({ step: 'idle', message: null });
    const { toast } = useToast();

    const handleAction = async (type: ActionType) => {
        // Start Cleanup
        setProgressState({ step: 'cleaning', message: 'Cleaning up database...' });
        const cleanupResult = await cleanupDatabaseAction();

        if (cleanupResult.error) {
            setProgressState({ step: 'error', message: cleanupResult.error });
            setTimeout(() => setProgressState({ step: 'idle', message: null }), 3000);
            return;
        }

        if (type === 'cleanup') {
            setProgressState({ step: 'success', message: 'Database cleaned successfully.' });
            setTimeout(() => setProgressState({ step: 'idle', message: null }), 3000);
            return;
        }

        // Proceed to Seeding
        setProgressState({ step: 'seeding', message: 'Seeding database...' });
        const seedResult = await seedDatabaseAction();

        if (seedResult.error) {
            setProgressState({ step: 'error', message: seedResult.error });
        } else {
            setProgressState({ step: 'success', message: seedResult.success ?? 'Database seeded successfully.' });
        }

        setTimeout(() => setProgressState({ step: 'idle', message: null }), 3000);
    };

    return (
        <div className="space-y-6">
            <ActionProgressModal state={progressState} />
            
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
                    <ConfirmationDialog
                        actionType="seed"
                        onConfirm={() => handleAction('seed')}
                    />
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
                     <ConfirmationDialog
                        actionType="cleanup"
                        onConfirm={() => handleAction('cleanup')}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
