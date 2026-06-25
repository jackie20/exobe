"use client";

import { useState } from "react";
import { useAddToCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";

export function AddToCartButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        max={99}
        value={quantity}
        onChange={(event) => setQuantity(Number(event.target.value))}
        className="h-10 w-16 rounded-md border border-input bg-background px-2 text-sm"
      />
      <Button
        size="lg"
        disabled={disabled || addToCart.isPending}
        onClick={() => addToCart.mutate({ productId, quantity })}
      >
        {addToCart.isPending ? "Adding..." : "Add to cart"}
      </Button>
      {addToCart.isSuccess && <span className="text-sm text-success">Added to cart</span>}
    </div>
  );
}
