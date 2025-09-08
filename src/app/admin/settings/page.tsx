
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Application Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This section is under construction. Future settings for the application will be managed here.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
