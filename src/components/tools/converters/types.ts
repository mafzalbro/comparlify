export type FormatCategory = "document" | "image" | "archive" | "audio" | "video" | "spreadsheet" | "presentation" | "vector" | "ebook";

export type Format = {
  id: string;
  name: string;
  category: FormatCategory;
  extension: string;
  mime: string;
};
