
'use client';

import { useState, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { ImageGalleryContext } from './image-gallery-context';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export function ImageUploader() {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [loadedBytes, setLoadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0); // bytes per second
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const context = useContext(ImageGalleryContext);

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
    setUploadProgress(0);
    setLoadedBytes(0);
    setTotalBytes(file.size);
    setUploadSpeed(0);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);
    
    let lastTime = Date.now();
    let lastLoaded = 0;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        const now = Date.now();
        const timeDiff = (now - lastTime) / 1000; // in seconds
        const bytesDiff = event.loaded - lastLoaded;
        const speed = timeDiff > 0 ? bytesDiff / timeDiff : 0;
        
        setUploadProgress(percentComplete);
        setLoadedBytes(event.loaded);
        setUploadSpeed(speed);

        lastTime = now;
        lastLoaded = event.loaded;
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setStatus('success');
        setUploadProgress(100);
        
        // Refresh the page to show the new image list from the server
        router.refresh();
        
        toast({
          title: 'Upload Successful!',
          description: 'Your image has been added to the library.',
        });
        
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
  }, [toast, context, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
  });

  const renderStatus = () => {
    switch (status) {
      case 'uploading':
        return (
          <div className="flex flex-col items-center gap-2 w-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-semibold">Uploading...</p>
            {uploadProgress !== null && (
              <div className="w-full mt-2 text-center">
                <Progress value={uploadProgress} className="w-full h-2" />
                <div className="text-xs text-muted-foreground mt-2 flex justify-between font-mono">
                    <span>{Math.round(uploadProgress)}%</span>
                    <span>{formatBytes(uploadSpeed)}/s</span>
                    <span>{formatBytes(loadedBytes)} / {formatBytes(totalBytes)}</span>
                </div>
              </div>
            )}
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
