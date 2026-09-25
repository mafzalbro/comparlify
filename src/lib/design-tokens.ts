/**
 * Shared design tokens for Tools & Compare surfaces.
 * Single source of truth for containers, card recipes, and label typography
 * so pages cannot drift apart again.
 */

/** Listing pages (hubs, category grids, compare landing). */
export const PAGE_CONTAINER = "max-w-6xl mx-auto px-4 sm:px-6";

/** Detail pages (tool detail, compare slug pages). */
export const DETAIL_CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6";

/** The one glass card recipe: large hero/panel cards. */
export const GLASS_CARD =
  "bg-card/40 backdrop-blur-md border border-border/40 rounded-4xl shadow-card";

/** Glass card recipe for small cards (tool cards, sidebar cards, FAQ items). */
export const GLASS_CARD_SM =
  "bg-card/40 backdrop-blur-md border border-border/40 rounded-2xl shadow-card";

/** Standard uppercase eyebrow/label typography. */
export const MICRO_LABEL = "text-[10px] font-bold uppercase tracking-widest";
