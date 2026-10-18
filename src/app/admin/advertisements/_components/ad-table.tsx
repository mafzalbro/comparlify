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
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import {
  createAdvertisement,
  deleteAdvertisement,
  toggleAdStatus,
  updateAdvertisement,
} from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const PLACEMENTS: AdPlacementType[] = [
  "HEADER",
  "SIDEBAR",
  "POST_TOP",
  "POST_BOTTOM",
  "COMPARISON_BETWEEN",
  "MOBILE_FIXED_BOTTOM",
];

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

  // Form State - matching your Prisma Schema
  const [formData, setFormData] = useState({
    content: "", // Acts as the name/script content
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
        allowedPages: formData.allowedPages,
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

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Target Pages (Regex/Path)
                </label>
                <Input
                  required
                  value={formData.allowedPages}
                  onChange={(e) =>
                    setFormData({ ...formData, allowedPages: e.target.value })
                  }
                  placeholder="e.g. *, /compare/*, /blog/*"
                />
              </div>

              {/* CONTENT FIELD - Since your schema doesn't have 'name' or 'scriptContent' */}
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
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {ad.allowedPages}
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
