import { Block } from "@/components/Skeletons";

export default function ProductDetailLoading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Block className="h-5 w-40" />
      <div className="grid gap-8 md:grid-cols-2">
        <Block className="aspect-square w-full" />
        <div className="space-y-4">
          <Block className="h-6 w-1/2" />
          <Block className="h-8 w-4/5" />
          <Block className="h-10 w-1/3" />
          <Block className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
