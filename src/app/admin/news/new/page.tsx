import { ArticleForm } from "../_components/article-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";

const getPlatforms = async () => {
  return prisma.platform.findMany({
    orderBy: { name: "asc" },
  });
};

export default async function NewArticlePage() {
  const platforms = await getPlatforms();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New News Article</h1>
        <Button asChild variant="ghost">
          <Link href="/admin/news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Link>
        </Button>
      </div>
      <ArticleForm platforms={platforms} />
    </div>
  );
}
