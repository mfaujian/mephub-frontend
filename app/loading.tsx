import { Block, ProductCardSkeleton } from "@/components/Skeletons";

export default function HomeLoading() {
  return (
    <div className="space-y-12" aria-busy="true">
      <Block className="h-64 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
