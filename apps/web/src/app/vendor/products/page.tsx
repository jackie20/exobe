"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useVendorProducts } from "@/hooks/use-vendor";
import { useCategories } from "@/hooks/use-products";
import { apiFetch, ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/format";

export default function VendorProductsPage() {
  const { data, isLoading } = useVendorProducts();
  const { data: categories } = useCategories();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      await apiFetch("/api/vendor/products", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          sku: formData.get("sku"),
          description: formData.get("description"),
          basePrice: Number(formData.get("basePrice")),
          stockQuantity: Number(formData.get("stockQuantity")),
          categoryIds: [String(formData.get("categoryId"))],
          images: [{ url: String(formData.get("imageUrl")) }],
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["vendor", "products"] });
      setShowForm(false);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Add product"}</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-lg border border-border p-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Product name</Label>
            <Input name="name" required />
          </div>
          <div className="space-y-1.5">
            <Label>SKU</Label>
            <Input name="sku" required />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <select name="categoryId" required className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              <option value="">Select a category</option>
              {categories?.data.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Price</Label>
            <Input name="basePrice" type="number" min={0} step="0.01" required />
          </div>
          <div className="space-y-1.5">
            <Label>Stock quantity</Label>
            <Input name="stockQuantity" type="number" min={0} required />
          </div>
          <div className="space-y-1.5">
            <Label>Image URL</Label>
            <Input name="imageUrl" type="url" required />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <textarea
              name="description"
              required
              minLength={20}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <Button type="submit" disabled={submitting} className="sm:col-span-2">
            {submitting ? "Submitting..." : "Submit for review"}
          </Button>
        </form>
      )}

      {isLoading ? null : !data || data.data.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No products yet.</p>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="py-2">Product</th>
              <th className="py-2">SKU</th>
              <th className="py-2">Price</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((product) => (
              <tr key={product.id} className="border-b border-border">
                <td className="py-3">{product.name}</td>
                <td className="py-3">{product.sku}</td>
                <td className="py-3">{formatMoney(Number(product.basePrice))}</td>
                <td className="py-3">{product.stockQuantity}</td>
                <td className="py-3">
                  <span className="rounded-full border px-2 py-0.5 text-xs font-medium">{product.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
