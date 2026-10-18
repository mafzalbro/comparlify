"use client";

import { useState, useTransition } from "react";
import {
  Advertisement,
  AdvertisementType,
  AdPlacementType,
} from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  X,
  Globe,
  Info,
} from "lucide-react";
import {
  createAdvertisement,
  deleteAdvertisement,
  toggleAdStatus,
  updateAdvertisement,
} from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PLACEMENTS: AdPlacementType[] = [
  "HEADER",
  "SIDEBAR",
  "POST_TOP",
  "POST_BOTTOM",
  "COMPARISON_BETWEEN",
  "MOBILE_FIXED_BOTTOM",
];

const PRESET_PATHS: { value: string; label: string }[] = [
  { value: "*", label: "All Pages" },
  { value: "/", label: "Home" },
  { value: "/blog/*", label: "Blog" },
  { value: "/news/*", label: "News" },
  { value: "/compare/*", label: "Comparisons" },
  { value: "/platform/*", label: "Platforms" },
  { value: "/community/*", label: "Community" },
  { value: "/tools/*", label: "Tools" },
  { value: "/migrate/*", label: "Migrations" },
  { value: "/alternatives/*", label: "Alternatives" },
];

/** Auto-prefix a leading slash for custom entries, but preserve wildcards. */
function normalizePath(input: string): string {
  const t = input.trim();
  if (!t) return "";
  if (t.startsWith("/") || t.startsWith("*")) return t;
  return "/" + t;
}

function TargetPagesInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [custom, setCustom] = useState("");
  const paths = value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const hasAllPages = paths.includes("*");

  const togglePreset = (p: string) => {
    if (p === "*") {
      // Toggling "All Pages" clears everything else
      onChange(hasAllPages ? "" : "*");
      return;
    }
    // Selecting a specific page removes the "*" wildcard
    const base = hasAllPages ? [] : [...paths];
    const next = base.includes(p) ? base.filter((x) => x !== p) : [...base, p];
    onChange(next.join(","));
  };

  const addCustom = () => {
    // Support pasting comma-separated values in one go
    const tokens = custom
      .split(",")
      .map((s) => normalizePath(s))
      .filter(Boolean);
    if (tokens.length === 0) {
      setCustom("");
      return;
    }
    const base = hasAllPages ? [] : [...paths];
    for (const t of tokens) {
      if (!base.includes(t)) base.push(t);
    }
    onChange(base.join(","));
    setCustom("");
  };

  const remove = (p: string) => {
    onChange(paths.filter((x) => x !== p).join(","));
  };

  return (
    <div className="space-y-3">
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_PATHS.map((p) => {
          const active = paths.includes(p.value);
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => togglePreset(p.value)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {p.value === "*" ? (
                <span className="inline-flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {p.label}
                </span>
              ) : (
                p.label
              )}
            </button>
          );
        })}
      </div>

      {/* Custom path input */}
      <div className="flex gap-2">
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="e.g. /checkout/* or /heygen-vs-elevenlabs"
          className="font-mono text-xs h-9"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="h-9"
        >
          Add
        </Button>
      </div>

      {/* Selected chips */}
      <div
        className={cn(
          "flex flex-wrap gap-1.5 min-h-9 p-2 rounded-lg border border-dashed transition-colors",
          paths.length === 0
            ? "border-amber-500/40 bg-amber-500/5"
            : "border-border/30 bg-muted/10",
        )}
      >
        {paths.length === 0 ? (
          <span className="text-[11px] text-amber-600 dark:text-amber-500 font-medium italic self-center px-1 flex items-center gap-1.5">
            <Info className="h-3 w-3 shrink-0" />
            No target pages selected — this ad will not show anywhere.
          </span>
        ) : (
          paths.map((p) => (
            <span
              key={p}
              className={cn(
                "inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase",
                p === "*"
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-secondary/60 text-foreground border border-border/30",
              )}
            >
              {p === "*" ? "ALL PAGES" : p}
              <button
                type="button"
                onClick={() => remove(p)}
                className="ml-0.5 rounded-sm hover:bg-destructive/10 hover:text-destructive transition-colors p-0.5"
                aria-label={`Remove ${p}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Advanced hint */}
      <p className="text-[10px] text-muted-foreground/60 font-medium leading-relaxed">
        Use <code className="font-mono text-primary/80">*</code> for wildcards.
        Comma-separated values are supported. Paths must start with{" "}
        <code className="font-mono text-primary/80">/</code> (auto-added).
      </p>
    </div>
  );
}

export function AdvertisementsTable({
  initialAds,
}: {
  initialAds: Advertisement[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    content: "",
    type: "IMAGE" as AdvertisementType,
    placement: "SIDEBAR" as AdPlacementType,
    allowedPages: "*",
    active: true,
    imageUrl: "",
    linkUrl: "",
  });

  const resetForm = () => {
    setFormData({
      content: "",
      type: "IMAGE",
      placement: "SIDEBAR",
      allowedPages: "*",
      active: true,
      imageUrl: "",
      linkUrl: "",
    });
    setEditingId(null);
  };

  const handleOpenEdit = (ad: Advertisement) => {
    setFormData({
      content: ad.content || "",
      type: ad.type,
      placement: ad.placement,
      allowedPages: ad.allowedPages || "*",
      active: ad.active,
      imageUrl: ad.imageUrl || "",
      linkUrl: ad.linkUrl || "",
    });
    setEditingId(ad.id);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload: Partial<Advertisement> = {
        content: formData.content,
        type: formData.type,
        placement: formData.placement,
        allowedPages: formData.allowedPages || "*",
        active: formData.active,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
      };

      let res;
      if (editingId) {
        res = await updateAdvertisement(editingId, payload);
      } else {
        res = await createAdvertisement(payload);
      }

      if (res.success) {
        toast({ title: editingId ? "Ad updated" : "Ad created" });
        setIsOpen(false);
        resetForm();
        router.refresh();
      } else {
        toast({ title: res.error, variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    startTransition(async () => {
      const res = await deleteAdvertisement(id);
      if (res.success) {
        toast({ title: "Ad deleted" });
        router.refresh();
      }
    });
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleAdStatus(id, !currentStatus);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <PlusCircle className="h-4 w-4" /> Create Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Advertisement" : "Create New Advertisement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, type: v as AdvertisementType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMAGE">Image Banner</SelectItem>
                      <SelectItem value="SCRIPT">
                        HTML / AdSense Script
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Placement Slot</label>
                  <Select
                    value={formData.placement}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        placement: v as AdPlacementType,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLACEMENTS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ENHANCED TARGET PAGES INPUT */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Pages</label>
                <TargetPagesInput
                  value={formData.allowedPages}
                  onChange={(v) =>
                    setFormData({ ...formData, allowedPages: v })
                  }
                />
              </div>

              <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
                <label className="text-sm font-medium">
                  {formData.type === "SCRIPT"
                    ? "Script HTML"
                    : "Internal Ad Content / Name"}
                </label>
                <Textarea
                  required
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder={
                    formData.type === "SCRIPT"
                      ? "<script>...</script>"
                      : "e.g. Sidebar Banner Q3"
                  }
                  rows={formData.type === "SCRIPT" ? 6 : 2}
                  className={
                    formData.type === "SCRIPT" ? "font-mono text-xs" : ""
                  }
                />
              </div>

              {formData.type === "IMAGE" && (
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image URL</label>
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Link URL (Destination)
                    </label>
                    <Input
                      value={formData.linkUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, linkUrl: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(c) =>
                    setFormData({ ...formData, active: c })
                  }
                  id="active-mode"
                />
                <label htmlFor="active-mode" className="text-sm font-medium">
                  Set as Active immediately
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {editingId ? "Update Ad" : "Create Ad"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Content / Identifier</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Target Pages</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialAds.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  No advertisements found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
            {initialAds.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell
                  className="font-medium max-w-50 truncate"
                  title={ad.content}
                >
                  {ad.content || (
                    <span className="text-muted-foreground italic">
                      No content
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {ad.placement.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground max-w-55 truncate">
                  {ad.allowedPages === "*" ? (
                    <span className="inline-flex items-center gap-1 text-primary font-bold">
                      <Globe className="h-3 w-3" /> All Pages
                    </span>
                  ) : (
                    ad.allowedPages
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {ad.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={ad.active}
                    onCheckedChange={() => handleToggle(ad.id, ad.active)}
                    disabled={isPending}
                  />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(ad)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(ad.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
