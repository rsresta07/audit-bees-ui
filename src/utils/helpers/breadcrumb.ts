export interface Category {
  id: string;
  title: string;
  parent?: Category | null;
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export const buildBreadcrumbItems = (
  parent: Category | null
): BreadcrumbItem[] => {
  if (!parent) return [];

  const trail = buildBreadcrumbItems(parent.parent ?? null);
  return [
    ...trail,
    {
      title: parent.title,
      href: `/dashboard/superadmin/categories/${parent.id}`,
    },
  ];
};
