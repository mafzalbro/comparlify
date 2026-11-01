import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { SUPPORTED_FORMATS } from "@/components/tools/converters/constants";
import { ConverterClientWrapper } from "@/components/tools/converters/converter-client-wrapper";
import { notFound } from "next/navigation";

interface ConversionPageProps {
  params: Promise<{ from: string; to: string }>;
}

// 1. GENERATE DYNAMIC METADATA FOR EACH CONVERTER PATH
export async function generateMetadata({
  params,
}: ConversionPageProps): Promise<Metadata> {
  const { from, to } = await params;

  const fromFormat = SUPPORTED_FORMATS.find((f) => f.id === from);
  const toFormat = SUPPORTED_FORMATS.find((f) => f.id === to);

  if (!fromFormat || !toFormat) return {};

  const fromName = fromFormat.name;
  const toName = toFormat.name;

  return generateSeoMetadata({
    title: `Convert ${fromName} to ${toName} Online | Free & Private | Comparlify`,
    description: `Easily convert ${fromName} files to ${toName} format. 100% free, private, and runs locally in your browser without uploading files.`,
    path: `/tools/converters/${from}/${to}`,
  });
}

// 2. SERVER COMPONENT WRAPPER
export default async function ConversionPage({ params }: ConversionPageProps) {
  const { from, to } = await params;

  const fromFormat = SUPPORTED_FORMATS.find((f) => f.id === from);
  const toFormat = SUPPORTED_FORMATS.find((f) => f.id === to);

  // 404 if the formats are invalid to prevent wasting SEO crawl budget
  if (!fromFormat || !toFormat) {
    notFound();
  }

  return <ConverterClientWrapper from={from} to={to} />;
}
