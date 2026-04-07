import { Format, FormatCategory } from "./types";

export const SUPPORTED_FORMATS: Format[] = [
  // Documents
  { id: "pdf", name: "PDF", category: "document", extension: "pdf", mime: "application/pdf" },
  { id: "docx", name: "DOCX", category: "document", extension: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  { id: "doc", name: "DOC", category: "document", extension: "doc", mime: "application/msword" },
  { id: "txt", name: "TXT", category: "document", extension: "txt", mime: "text/plain" },
  { id: "rtf", name: "RTF", category: "document", extension: "rtf", mime: "application/rtf" },
  { id: "odt", name: "ODT", category: "document", extension: "odt", mime: "application/vnd.oasis.opendocument.text" },
  { id: "html", name: "HTML", category: "document", extension: "html", mime: "text/html" },
  { id: "md", name: "MD", category: "document", extension: "md", mime: "text/markdown" },
  
  // Images
  { id: "png", name: "PNG", category: "image", extension: "png", mime: "image/png" },
  { id: "jpg", name: "JPG", category: "image", extension: "jpg", mime: "image/jpeg" },
  { id: "jpeg", name: "JPEG", category: "image", extension: "jpeg", mime: "image/jpeg" },
  { id: "webp", name: "WEBP", category: "image", extension: "webp", mime: "image/webp" },
  { id: "gif", name: "GIF", category: "image", extension: "gif", mime: "image/gif" },
  { id: "bmp", name: "BMP", category: "image", extension: "bmp", mime: "image/bmp" },
  { id: "tiff", name: "TIFF", category: "image", extension: "tiff", mime: "image/tiff" },
  { id: "ico", name: "ICO", category: "image", extension: "ico", mime: "image/x-icon" },
  { id: "heic", name: "HEIC", category: "image", extension: "heic", mime: "image/heic" },

  // Vectors
  { id: "svg", name: "SVG", category: "vector", extension: "svg", mime: "image/svg+xml" },
  { id: "ai", name: "AI", category: "vector", extension: "ai", mime: "application/postscript" },
  { id: "eps", name: "EPS", category: "vector", extension: "eps", mime: "application/postscript" },
  { id: "psd", name: "PSD", category: "vector", extension: "psd", mime: "image/vnd.adobe.photoshop" },

  // Spreadsheets
  { id: "xlsx", name: "XLSX", category: "spreadsheet", extension: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  { id: "xls", name: "XLS", category: "spreadsheet", extension: "xls", mime: "application/vnd.ms-excel" },
  { id: "csv", name: "CSV", category: "spreadsheet", extension: "csv", mime: "text/csv" },
  { id: "ods", name: "ODS", category: "spreadsheet", extension: "ods", mime: "application/vnd.oasis.opendocument.spreadsheet" },

  // Presentations
  { id: "pptx", name: "PPTX", category: "presentation", extension: "pptx", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  { id: "ppt", name: "PPT", category: "presentation", extension: "ppt", mime: "application/vnd.ms-powerpoint" },
  { id: "odp", name: "ODP", category: "presentation", extension: "odp", mime: "application/vnd.oasis.opendocument.presentation" },

  // Audio
  { id: "mp3", name: "MP3", category: "audio", extension: "mp3", mime: "audio/mpeg" },
  { id: "wav", name: "WAV", category: "audio", extension: "wav", mime: "audio/wav" },
  { id: "ogg", name: "OGG", category: "audio", extension: "ogg", mime: "audio/ogg" },
  { id: "m4a", name: "M4A", category: "audio", extension: "m4a", mime: "audio/mp4" },
  { id: "flac", name: "FLAC", category: "audio", extension: "flac", mime: "audio/flac" },
  { id: "aac", name: "AAC", category: "audio", extension: "aac", mime: "audio/aac" },

  // Video
  { id: "mp4", name: "MP4", category: "video", extension: "mp4", mime: "video/mp4" },
  { id: "avi", name: "AVI", category: "video", extension: "avi", mime: "video/x-msvideo" },
  { id: "mov", name: "MOV", category: "video", extension: "mov", mime: "video/quicktime" },
  { id: "webm", name: "WEBM", category: "video", extension: "webm", mime: "video/webm" },
  { id: "mkv", name: "MKV", category: "video", extension: "mkv", mime: "video/x-matroska" },
  { id: "wmv", name: "WMV", category: "video", extension: "wmv", mime: "video/x-ms-wmv" },

  // Archives
  { id: "zip", name: "ZIP", category: "archive", extension: "zip", mime: "application/zip" },
  { id: "rar", name: "RAR", category: "archive", extension: "rar", mime: "application/x-rar-compressed" },
  { id: "7z", name: "7Z", category: "archive", extension: "7z", mime: "application/x-7z-compressed" },
  { id: "tar", name: "TAR", category: "archive", extension: "tar", mime: "application/x-tar" },
  { id: "gz", name: "GZ", category: "archive", extension: "gz", mime: "application/gzip" },

  // Ebooks
  { id: "epub", name: "EPUB", category: "ebook", extension: "epub", mime: "application/epub+zip" },
  { id: "mobi", name: "MOBI", category: "ebook", extension: "mobi", mime: "application/x-mobipocket-ebook" },
  { id: "azw3", name: "AZW3", category: "ebook", extension: "azw3", mime: "application/vnd.amazon.mobi8-ebook" },
];

export const getIds = (category: FormatCategory) => SUPPORTED_FORMATS.filter(f => f.category === category).map(f => f.id);

export interface ConversionPath {
  from: string;
  to: string[];
  driver: 'pdf-to-image' | 'image-to-pdf' | 'image-to-image' | 'compress-pdf' | 'html-to-image' | 'create-zip' | 'cloud-remote';
  label?: string;
  category?: FormatCategory;
  popular?: boolean;
}

export const CONVERSION_PATHS: ConversionPath[] = [
  // PDF to Image
  { from: "pdf", to: ["png", "jpg", "jpeg", "webp", "bmp"], driver: "pdf-to-image", popular: true },
  
  // Image to Document
  { from: "png", to: ["pdf"], driver: "image-to-pdf", popular: true },
  { from: "jpg", to: ["pdf"], driver: "image-to-pdf", popular: true },
  { from: "jpeg", to: ["pdf"], driver: "image-to-pdf" },
  { from: "webp", to: ["pdf"], driver: "image-to-pdf" },
  { from: "bmp", to: ["pdf"], driver: "image-to-pdf" },
  { from: "gif", to: ["pdf"], driver: "image-to-pdf" },
  
  // Image to Image
  ...getIds("image").map(imgId => ({
    from: imgId,
    to: getIds("image").filter(id => id !== "heic" && id !== "tiff" && id !== "ico"),
    driver: "image-to-image" as const,
    popular: imgId === "png" || imgId === "jpg" || imgId === "webp"
  })),

  // Compress PDF
  { from: "pdf", to: ["pdf"], driver: "compress-pdf", popular: true },

  // Archive creation
  ...SUPPORTED_FORMATS.map(f => ({
    from: f.id,
    to: ["zip"],
    driver: "create-zip" as const
  })),

  // HTML to Image (Specialized local driver) - FIXED CATEGORY to 'image'
  { 
    from: "html", 
    to: ["png", "jpg", "jpeg", "webp"], 
    driver: "html-to-image",
    category: "image" as FormatCategory,
    popular: true
  },

  // Document to PDF, Text, etc.
  ...getIds("document").filter(id => id !== "pdf" && id !== "html").map(docId => ({
    from: docId,
    to: ["pdf", "txt"],
    driver: "cloud-remote" as const
  })),

  // Spreadsheet paths
  ...getIds("spreadsheet").map(spreadId => ({
    from: spreadId,
    to: getIds("spreadsheet").filter(id => id !== spreadId).concat(["pdf", "html"]),
    driver: "cloud-remote" as const,
    popular: spreadId === "xlsx"
  })),

  // Presentation paths
  ...getIds("presentation").map(presId => ({
    from: presId,
    to: ["pdf", "jpg", "png"],
    driver: "cloud-remote" as const,
    popular: presId === "pptx"
  })),

  // Audio paths
  ...getIds("audio").map(audioId => ({
    from: audioId,
    to: getIds("audio").filter(id => id !== audioId),
    driver: "cloud-remote" as const,
    popular: audioId === "mp3"
  })),

  // Video paths
  ...getIds("video").map(videoId => ({
    from: videoId,
    to: getIds("video").filter(id => id !== videoId),
    driver: "cloud-remote" as const,
    popular: videoId === "mp4"
  })),

  // Ebook paths
  ...getIds("ebook").map(ebookId => ({
    from: ebookId,
    to: ["pdf", "txt"],
    driver: "cloud-remote" as const,
    popular: ebookId === "epub"
  })),
];
