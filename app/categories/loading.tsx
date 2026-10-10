import { Block } from "@/components/Skeletons";

export default function CategoriesLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Block className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Block key={index} className="h-44 w-full" />
        ))}
      </div>
    </div>
  );
}
