"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProduct } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import { formatMoney } from "@/lib/format";

export function QuickViewDialog({
  slug,
  open,
  onOpenChange,
}: {
  slug: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data } = useProduct(slug ?? "");
  const addToCart = useAddToCart();
  const product = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {product ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
              {product.images[0] && (
                <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl">{product.name}</DialogTitle>
              <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="size-4 fill-warning text-warning" />
                {product.avgRating.toFixed(1)} ({product.reviewCount})
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">
                  {formatMoney(product.price, product.currency)}
                </span>
                {product.isOnSale && (
                  <span className="text-muted-foreground line-through">
                    {formatMoney(product.basePrice, product.currency)}
                  </span>
                )}
              </div>
              {product.shortDescription && (
                <p className="mt-3 text-sm text-muted-foreground">{product.shortDescription}</p>
              )}
              <div className="mt-6 flex gap-3">
                <Button disabled={!product.inStock} onClick={() => addToCart.mutate({ productId: product.id })}>
                  {product.inStock ? "Add to cart" : "Out of stock"}
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/products/${product.slug}`} onClick={() => onOpenChange(false)}>
                    View full details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
