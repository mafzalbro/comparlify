"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Advertisement, AdvertisementType, AdPlacementType } from "@prisma/client";

export async function getAdvertisements() {
  return prisma.advertisement.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createAdvertisement(data: Partial<Advertisement>) {
  try {
    await prisma.advertisement.create({
      data: {
        // 'name' doesn't exist in your schema, using 'content' as the main text field
        content: data.content || "Untitled Ad",
        type: data.type as AdvertisementType,
        placement: data.placement as AdPlacementType,
        allowedPages: data.allowedPages || "*",
        active: data.active ?? true,
        imageUrl: data.type === "IMAGE" ? data.imageUrl : null,
        linkUrl: data.type === "IMAGE" ? data.linkUrl : null,
      },
    });
    
    revalidatePath("/admin/advertisements");
    revalidatePath("/", "layout"); // Clear frontend cache
    return { success: true };
  } catch (error) {
    console.error("Failed to create ad:", error);
    return { success: false, error: "Failed to create advertisement." };
  }
}

export async function updateAdvertisement(id: string, data: Partial<Advertisement>) {
  try {
    await prisma.advertisement.update({
      where: { id },
      data: {
        content: data.content,
        type: data.type as AdvertisementType,
        placement: data.placement as AdPlacementType,
        allowedPages: data.allowedPages,
        active: data.active,
        imageUrl: data.type === "IMAGE" ? data.imageUrl : null,
        linkUrl: data.type === "IMAGE" ? data.linkUrl : null,
      },
    });

    revalidatePath("/admin/advertisements");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update ad:", error);
    return { success: false, error: "Failed to update advertisement." };
  }
}

export async function deleteAdvertisement(id: string) {
  try {
    await prisma.advertisement.delete({ where: { id } });
    revalidatePath("/admin/advertisements");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete advertisement." };
  }
}

export async function toggleAdStatus(id: string, active: boolean) {
  try {
    await prisma.advertisement.update({
      where: { id },
      data: { active },
    });
    revalidatePath("/admin/advertisements");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to toggle status." };
  }
}