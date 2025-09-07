import { Video } from 'lucide-react';
import { VideoScripterForm } from '@/components/video-scripter-form';

export default function VideoScripterPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <Video className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">AI Video Script Assistant</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Create compelling, word-for-word scripts for your video lessons in seconds.
          </p>
        </div>
        <VideoScripterForm />
      </div>
    </div>
  );
}
