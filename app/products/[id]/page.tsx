import type { Metadata } from "next";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Product #${id}` };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  return <h1 className="text-2xl font-bold text-brand">Product #{id}</h1>;
}
