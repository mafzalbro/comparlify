
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';

export function ImageUploader() {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size cannot exceed 5MB.');
        setStatus('error');
        return;
    }

    setStatus('uploading');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setStatus('success');
        setUploadProgress(100);
        toast({
          title: 'Upload Successful!',
          description: 'Your image has been added to the library.',
        });
        // Refresh the server component to show the new image
        router.refresh(); 
        setTimeout(() => {
            setStatus('idle');
            setUploadProgress(null);
        }, 2000);
      } else {
        const response = JSON.parse(xhr.responseText);
        setError(response.error || 'An unknown error occurred.');
        setStatus('error');
        setUploadProgress(null);
      }
    };

    xhr.onerror = () => {
      setError('A network error occurred. Please try again.');
      setStatus('error');
      setUploadProgress(null);
    };

    xhr.send(formData);
  }, [toast, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
  });

  const renderStatus = () => {
    switch (status) {
      case 'uploading':
        return (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-semibold">Uploading...</p>
            {uploadProgress !== null && <Progress value={uploadProgress} className="w-full mt-2" />}
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center gap-2 text-green-600">
            <CheckCircle className="h-8 w-8" />
            <p className="font-semibold">Upload Complete!</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center gap-2 text-destructive">
            <AlertTriangle className="h-8 w-8" />
            <p className="font-semibold">Upload Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <UploadCloud className="h-8 w-8" />
            <p className="font-semibold">{isDragActive ? 'Drop the file here...' : 'Click to upload or drag & drop'}</p>
            <p className="text-xs">Supports PNG, JPG, GIF, WEBP up to 5MB.</p>
          </div>
        );
    }
  };

  return (
    <div
      {...getRootProps()}
      className={`flex items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-border'
      }`}
    >
      <input {...getInputProps()} />
      {renderStatus()}
    </div>
  );
}
