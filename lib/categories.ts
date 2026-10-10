import type { Category, CategoryOption } from "@/types";

export function toCategoryOptions(categories: Category[]): CategoryOption[] {
  return categories.flatMap((category) =>
    category.subcategories.length > 0
      ? category.subcategories.map((child) => ({
          id: child.id,
          name: `${category.name} / ${child.name}`,
        }))
      : [{ id: category.id, name: category.name }],
  );
}

export function findCategoryName(categories: Category[], id: number): string | undefined {
  for (const category of categories) {
    if (category.id === id) return category.name;
    const child = category.subcategories.find((sub) => sub.id === id);
    if (child) return child.name;
  }
  return undefined;
}
