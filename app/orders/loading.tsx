import { Block } from "@/components/Skeletons";

export default function OrdersLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Block className="h-8 w-40" />
      <Block className="h-10 w-full" />
      {Array.from({ length: 3 }, (_, index) => (
        <Block key={index} className="h-40 w-full" />
      ))}
    </div>
  );
}
