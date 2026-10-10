import { Block, ProductGridSkeleton } from "@/components/Skeletons";

export default function ProductsLoading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Block className="h-8 w-48" />
      <Block className="h-10 w-full" />
      <ProductGridSkeleton count={6} />
    </div>
  );
}
