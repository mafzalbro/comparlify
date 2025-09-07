import { PostForm } from '../_components/post-form';

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      <PostForm />
    </div>
  );
}