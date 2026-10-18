import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdvertisements } from "./actions";
import { AdvertisementsTable } from "./_components/ad-table";

export const metadata = {
  title: "Manage Advertisements | Admin",
};

export default async function AdvertisementsPage() {
  const ads = await getAdvertisements();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Advertisements</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ad Placements</CardTitle>
          <CardDescription>
            Manage image banners and script tags across different sections of
            the website. Ads are served dynamically based on the placement slot
            and target page path.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdvertisementsTable initialAds={ads} />
        </CardContent>
      </Card>
    </div>
  );
}
