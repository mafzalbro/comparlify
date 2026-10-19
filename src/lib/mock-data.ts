/**
 * Static mock data loaded from live MongoDB Atlas dump.
 * This data is used by the Mock Prisma Client when BYPASS_MOCK !== "true",
 * enabling zero-database builds and deployments.
 *
 * Generated from: scripts/dump-mongo.ts
 * Source: MongoDB Atlas (comparlify_db)
 */

import siteContentData from "../data/live-backup/site-content.json";
import advertisementsData from "../data/live-backup/advertisements.json";
import usersData from "../data/live-backup/users.json";

export interface MockSiteContent {
  id: string;
  key: string;
  value: string;
  group: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockAdvertisement {
  id: string;
  type: string;
  content: string;
  imageUrl: string | null;
  linkUrl: string | null;
  placement: string;
  active: boolean;
  allowedPages: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  emailVerified: string | null;
  image: string | null;
  username: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  role: string;
  onboarded: boolean;
  newsletter: boolean;
  suspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockSiteContent: MockSiteContent[] = siteContentData as MockSiteContent[];
export const mockAdvertisements: MockAdvertisement[] = advertisementsData as MockAdvertisement[];
export const mockUsers: MockUser[] = usersData as MockUser[];

/**
 * Mock ad placements — uses ONLY the real ads from the live MongoDB dump.
 * No placeholder ads are added.
 */
export const mockAdPlacements: MockAdvertisement[] = [...mockAdvertisements];
