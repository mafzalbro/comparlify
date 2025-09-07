import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PostForm } from '../../_components/post-form';

async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
  });
  return post;
}

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
      <PostForm post={post} />
    </div>
  );
}