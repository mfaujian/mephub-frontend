import ProductGrid from "@/components/ProductGrid";
import { mockCategories, mockProducts } from "@/lib/mock-data";

export default function Home() {
  return <ProductGrid initialProducts={mockProducts} categories={mockCategories} />;
}
