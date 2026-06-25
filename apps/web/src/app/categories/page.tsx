import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCategoryIcon } from "@/lib/category-icons";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.name);
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center font-medium transition-shadow hover:shadow-md"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Icon className="size-7" />
              </span>
              {category.name}
              <p className="text-xs text-muted-foreground">{category._count.products} products</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
