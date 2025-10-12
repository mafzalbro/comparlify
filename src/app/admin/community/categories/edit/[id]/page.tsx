
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ForumCategoryForm } from '../../_components/forum-category-form';
import type { ForumCategory } from '@prisma/client';

async function getCategory(id: string): Promise<ForumCategory | null> {
    return prisma.forumCategory.findUnique({
        where: { id },
    });
}

export default async function EditForumCategoryPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const category = await getCategory(id);

    if (!category) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit Forum Category</h1>
            <ForumCategoryForm category={category} />
        </div>
    );
}
