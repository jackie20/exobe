import Image from "next/image";
import { CONTAINER } from "@/lib/layout";

const POSTS = [
  {
    title: "5 tips for smarter online shopping",
    excerpt: "From comparing prices to reading vendor reviews, here's how to get the most out of every order.",
    image: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80&auto=format&fit=crop",
  },
  {
    title: "Supporting local vendors",
    excerpt: "How Exobe Africa connects shoppers with small businesses and independent makers across the continent.",
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80&auto=format&fit=crop",
  },
  {
    title: "Packing for delivery, the right way",
    excerpt: "A look at how our vendors prepare orders to make sure they arrive safely, every time.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80&auto=format&fit=crop",
  },
];

export default function BlogPage() {
  return (
    <div className={`${CONTAINER} py-12`}>
      <h1 className="text-2xl font-semibold">Exobe Africa Blog</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Shopping tips, vendor spotlights, and platform updates — full articles are coming soon. Here&apos;s a
        preview of what we&apos;re working on.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {POSTS.map((post) => (
          <div key={post.title} className="overflow-hidden rounded-lg border border-border">
            <div className="relative aspect-[4/3]">
              <Image src={post.image} alt={post.title} fill className="object-cover" />
            </div>
            <div className="p-4">
              <p className="font-medium">{post.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
