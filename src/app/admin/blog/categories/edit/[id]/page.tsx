
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BlogCategoryForm } from '../../_components/blog-category-form';
import type { PostCategory } from '@prisma/client';

async function getCategory(id: string): Promise<PostCategory | null> {
    return prisma.postCategory.findUnique({
        where: { id },
    });
}

export default async function EditBlogCategoryPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const category = await getCategory(id);

    if (!category) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit Blog Category</h1>
            <BlogCategoryForm category={category} />
        </div>
    );
}
