
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    return NextResponse.json({ error: 'File size exceeds 5MB.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate a unique filename
  const extension = file.name.split('.').pop();
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const randomString = Math.random().toString(36).substring(2, 8);
  const filename = `${timestamp}_${randomString}.${extension}`;
  
  // Define path and ensure the directory exists
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  const path = join(uploadsDir, filename);

  try {
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path, buffer);
  } catch (error) {
    console.error('Failed to write file', error);
    return NextResponse.json({ error: 'Failed to save file.' }, { status: 500 });
  }

  const fileUrl = `/uploads/${filename}`;

  // Save metadata to database
  try {
    const image = await prisma.image.create({
      data: {
        filename: filename,
        url: fileUrl,
        altText: file.name, // Use original filename as default alt text
        size: file.size,
        authorId: session.user.id,
      },
    });
    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error('Failed to save image metadata', error);
    return NextResponse.json({ error: 'Failed to save image metadata.' }, { status: 500 });
  }
}
