import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import { mockCategories, mockProducts } from "@/lib/mock-data";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <ProductGrid initialProducts={mockProducts} categories={mockCategories} />
      </main>
      <Footer />
    </>
  );
}
