
type NavLink = {
  href: string;
  label: string;
};

type Content = Record<string, string | undefined>;

// Maps routes to their module enable/disable settings.
const MODULE_ROUTES: any = {
  "/community": "community",
  "/tools/ai": "ai",
  "/tools": "tools",
  "/news": "news",
  "/compare": "compare",
  "/blog": "blog",
  "/about": "about",
  "/contact": "contact",
} as const;

export function isModuleEnabled(
  module: string,
  content: Content,
): boolean {
  // Modules without a setting remain enabled by default.
  return content[`module.${module}.enabled`] !== "false";
}

export function isRouteEnabled(
  href: string,
  content: Content,
): boolean {
  const matchingRoute = Object.keys(MODULE_ROUTES)
    .sort((a, b) => b.length - a.length)
    .find(
      (route) => href === route || href.startsWith(`${route}/`),
    );

  if (!matchingRoute) return true;

  const module = MODULE_ROUTES[matchingRoute];

  return isModuleEnabled(module, content);
}

export function filterNavigation(
  links: NavLink[],
  content: Content,
): NavLink[] {
  return links.filter((link) =>
    isRouteEnabled(link.href, content),
  );
}

export function parseNavigation(
  value: string | undefined,
): NavLink[] {
  try {
    const parsed: unknown = JSON.parse(value || "[]");

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (link): link is NavLink =>
        typeof link?.href === "string" &&
        typeof link?.label === "string",
    );
  } catch {
    return [];
  }
}
