import {
  FileCode,
  CheckCircle,
  Minimize2,
  Eye,
  Lock,
  Unlock,
  Link2,
  FileKey,
  Fingerprint,
  KeyRound,
  FileCheck,
  Code,
  Layout,
  Terminal,
  Database,
  FileText,
  FileJson,
  Clock,
  Calendar,
  Layers,
  Scissors,
  FileSymlink,
  Image,
  Sparkles,
  Calculator,
  Compass,
  Zap,
} from "lucide-react";

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  category: "developer" | "pdf" | "image" | "text" | "calculators" | "ai";
  subcategory?: string;
  slug: string; // The URL slug segment for the tool
  status?: string;
  tag?: string;
  metaTitle: string;
  metaDescription: string;
  whatIsIt: string;
  howToUse: string;
  example?: string;
  faqs: ToolFAQ[];
  relatedTools?: string[];
  legacyComponent?: string; // Key to map existing tool component
}

export const CATEGORIES = {
  developer: {
    name: "Developer Tools",
    description: "Surgical-grade formatters, encoders, generators, and testers for high-performance development workflows.",
    subcategories: {
      json: "JSON Tools",
      encoding: "Encoding & Decoding",
      formatters: "Formatters & Minifiers",
      generators: "Generators",
      testing: "Testing Tools",
      converters: "Converters",
    },
  },
  pdf: {
    name: "PDF Tools",
    description: "In-browser, high-fidelity PDF manipulation tools with 100% privacy and Zero-Server storage.",
    subcategories: {},
  },
  image: {
    name: "Image Tools",
    description: "In-browser, high-fidelity image manipulation, optimization, and conversion tools with 100% privacy and zero-server storage.",
    subcategories: {},
  },
  text: {
    name: "Text Tools",
    description: "Surgical text manipulators, case converters, diff checkers, deduplicators, and slug generators running 100% in-browser.",
    subcategories: {},
  },
  calculators: {
    name: "Calculators & Planning",
    description: "Strategic calculators, planners, and matchmakers built to optimize tech stack overhead.",
    subcategories: {
      strategic: "Strategic Creator Calculators",
    },
  },
  ai: {
    name: "AI Assistants",
    description: "Legacy creator-first artificial intelligence tools for learning, outlines, and curriculum design.",
    subcategories: {
      creators: "Creator AI Tools",
    },
  },
};

export const TOOLS: ToolDefinition[] = [
  // ── DEVELOPER TOOLS ──
  // 1. JSON Formatter
  {
    id: "json-formatter",
    title: "JSON Formatter",
    description: "Format, beautify, and inspect raw JSON structures with customizable indentation spacing and visual syntax feedback.",
    category: "developer",
    subcategory: "json",
    slug: "formatter",
    status: "Live",
    tag: "🔥",
    metaTitle: "Free JSON Formatter & Beautifier Online | Comparlify",
    metaDescription: "Format and beautify your raw JSON string instantly in-browser. Customize spaces, handle syntax errors gracefully, and export with zero-server storage.",
    whatIsIt: "The JSON Formatter is an interactive utility that structures unstructured, raw JSON data into a clean, human-readable format. It validates syntax in real-time, displays appropriate spacing, and ensures perfect syntax nesting.",
    howToUse: "Paste your raw or compressed JSON block into the input editor. Choose your desired indentation spacing (2 spaces, 4 spaces, or tabs) and click 'Format JSON'. Copy or download the beautifully formatted JSON instantly.",
    example: 'Input:\n{"user":{"id":1,"name":"Alice","skills":["React","NextJS"]}}\n\nOutput:\n{\n  "user": {\n    "id": 1,\n    "name": "Alice",\n    "skills": [\n      "React",\n      "NextJS"\n    ]\n  }\n}',
    faqs: [
      { question: "Is my JSON data sent to a server?", answer: "No, all formatting, beautification, and validation are performed 100% locally inside your browser. No data ever leaves your device." },
      { question: "Can it handle invalid JSON syntax?", answer: "Yes, it highlights precisely where syntax errors occur with specific line and column indicators so you can correct them quickly." },
    ],
    relatedTools: ["json-validator", "json-minifier", "json-viewer"],
  },
  // 2. JSON Validator
  {
    id: "json-validator",
    title: "JSON Validator",
    description: "Validate JSON structures against formal specifications. Receive precise error locations and line markers.",
    category: "developer",
    subcategory: "json",
    slug: "validator",
    status: "Live",
    tag: "🔥",
    metaTitle: "Interactive JSON Validator Online | Comparlify",
    metaDescription: "Check if your JSON is compliant with official RFC 8259 syntax specifications. Spot syntax errors, missing trailing commas, and unquoted keys in real-time.",
    whatIsIt: "JSON Validator analyzes raw string inputs to check for standard-compliant JSON. It parses tokens and highlights typical issues such as unquoted keys, trailing commas, or missing brackets, pointing you to the exact line.",
    howToUse: "Enter your JSON string. The validator will dynamically evaluate compliance. If valid, a success confirmation is shown; otherwise, a detailed breakdown of the syntax exception is presented.",
    example: 'Input:\n{\n  name: "John",\n  "age": 30,\n}\n\nOutput (Validation Failures):\n- Keys must be wrapped in double-quotes (name).\n- Trailing comma after age is invalid in standard JSON.',
    faqs: [
      { question: "Why is a strict JSON validator necessary?", answer: "Many configuration managers or API clients crash when encountering non-compliant JSON. Our tool ensures your structures are universally safe." },
    ],
    relatedTools: ["json-formatter", "json-minifier"],
  },
  // 3. JSON Minifier
  {
    id: "json-minifier",
    title: "JSON Minifier",
    description: "Compress standard JSON payloads to minimum sizes by removing redundant whitespaces, tabs, and comments.",
    category: "developer",
    subcategory: "json",
    slug: "minifier",
    status: "Live",
    tag: "🔥",
    metaTitle: "Online JSON Minifier & Compressor | Comparlify",
    metaDescription: "Minimize and compress JSON payloads to decrease payload sizes. Free tool to strip whitespaces, line breaks, and formatting from standard JSON blocks.",
    whatIsIt: "The JSON Minifier is built for network optimization. By removing indentation, spacing, and carriage returns, it reduces JSON payload size to improve API response speeds and load times.",
    howToUse: "Paste formatted JSON, press 'Minify JSON', and copy the compacted single-line output.",
    example: 'Formatted Input:\n{\n  "role": "admin",\n  "active": true\n}\n\nMinified Output:\n{"role":"admin","active":true}',
    faqs: [
      { question: "Does minifying JSON change the actual data structure?", answer: "Not at all. It strictly cleans out spacing characters. The key-value relationships and data types remain perfectly intact." },
    ],
    relatedTools: ["json-formatter", "json-viewer"],
  },
  // 4. JSON Viewer
  {
    id: "json-viewer",
    title: "JSON Viewer",
    description: "Explore complex, multi-layered JSON trees using a dynamic expandable/collapsible visual interface.",
    category: "developer",
    subcategory: "json",
    slug: "viewer",
    status: "Live",
    tag: "🔥",
    metaTitle: "Interactive JSON Viewer & Tree Inspector | Comparlify",
    metaDescription: "Browse complex nested JSON trees. Expand, collapse, and query specific nodes easily inside our responsive tree viewer.",
    whatIsIt: "The JSON Viewer translates raw JSON text into an interactive graphical DOM-tree, letting developers dive deep into object hierarchies without losing place in long files.",
    howToUse: "Input your JSON, click 'Parse & View', and click on toggle icons to expand or contract nested objects and lists.",
    faqs: [
      { question: "Is there a limit to the JSON file size?", answer: "It processes files up to 10MB completely inside the browser window with smooth rendering cycles." },
    ],
    relatedTools: ["json-formatter", "json-minifier"],
  },
  // 5. Base64 Encoder
  {
    id: "base64-encoder",
    title: "Base64 Encoder",
    description: "Encode plaintext, strings, or binary-safe expressions into clean RFC 4648 Base64 strings.",
    category: "developer",
    subcategory: "encoding",
    slug: "base64-encoder",
    status: "Live",
    tag: "High",
    metaTitle: "Safe Base64 Encoder Online | Comparlify",
    metaDescription: "Encode UTF-8 plaintext strings to Base64 standard format quickly. Free utility with offline capabilities and high-fidelity binary compatibility.",
    whatIsIt: "The Base64 Encoder transforms standard alphanumeric characters or binary into 64-character ASCII streams, perfect for embedding simple payloads in header assets or query tokens.",
    howToUse: "Type or paste standard text into the Input section. The Base64 encoded output is calculated dynamically.",
    example: "Input: Hello World\nOutput: SGVsbG8gV29ybGQ=",
    faqs: [
      { question: "Is Base64 an encryption method?", answer: "No. Base64 is strictly an encoding format to transfer binary payloads safely over text-based networks; it contains zero cryptographic security." },
    ],
    relatedTools: ["base64-decoder", "url-encoder"],
  },
  // 6. Base64 Decoder
  {
    id: "base64-decoder",
    title: "Base64 Decoder",
    description: "Decode ASCII Base64 formatted strings back into standard human-readable UTF-8 text.",
    category: "developer",
    subcategory: "encoding",
    slug: "base64-decoder",
    status: "Live",
    tag: "High",
    metaTitle: "Online Base64 Decoder Tool | Comparlify",
    metaDescription: "Decode Base64 characters back to clear UTF-8 plaintext. Our client-side decoder resolves multi-byte symbols safely and handles invalid inputs gracefully.",
    whatIsIt: "Base64 Decoder converts ASCII streams back to original text or byte lists with full support for special characters and multi-byte UTF-8 structures.",
    howToUse: "Input any valid Base64 payload. The decoded plaintext will immediately populate the Output panel.",
    example: "Input: SGVsbG8gV29ybGQ=\nOutput: Hello World",
    faqs: [
      { question: "What happens if I try to decode non-Base64 text?", answer: "The application handles parsing exceptions gracefully and flags that the string does not follow the standard Base64 character alphabet." },
    ],
    relatedTools: ["base64-encoder", "url-decoder"],
  },
  // 7. URL Encoder
  {
    id: "url-encoder",
    title: "URL Encoder",
    description: "Percent-encode URL paths, query parameters, and special characters for compliant HTTP request protocols.",
    category: "developer",
    subcategory: "encoding",
    slug: "url-encoder",
    status: "Live",
    tag: "High",
    metaTitle: "Fast URL Encoder Online | Percent-Encoding | Comparlify",
    metaDescription: "Encode query strings and web addresses using standard URL/percent-encoding specifications. Ensure complete compatibility across all network clients.",
    whatIsIt: "The URL Encoder swaps non-ASCII or reserved characters (like spaces, slashes, or ampersands) with their safe hexadecimal percent equivalents, complying with RFC 3986.",
    howToUse: "Input a standard URL or query parameters, and access the fully percent-encoded output stream instantly.",
    example: "Input: category=developer tools & codes\nOutput: category%3Ddeveloper%20tools%20%26%20codes",
    faqs: [
      { question: "Why is URL encoding vital?", answer: "Unencoded symbols like spaces or ampersands can break URL parsing on backend servers, resulting in bad request exceptions." },
    ],
    relatedTools: ["url-decoder", "base64-encoder"],
  },
  // 8. URL Decoder
  {
    id: "url-decoder",
    title: "URL Decoder",
    description: "Translate percent-encoded strings and query params back to standard readable web paths.",
    category: "developer",
    subcategory: "encoding",
    slug: "url-decoder",
    status: "Live",
    tag: "High",
    metaTitle: "Interactive URL Decoder & Percent-Unescape | Comparlify",
    metaDescription: "Convert percent-escaped URLs and query strings back to human-readable characters safely inside our browser-based utility.",
    whatIsIt: "URL Decoder translates hex percent-escapes (like %20 or %3D) back into their standard human-readable UTF-8 symbols.",
    howToUse: "Enter any percent-encoded address or string. The decoded text appears instantly.",
    example: "Input: category%3Ddeveloper%20tools%20%26%20codes\nOutput: category=developer tools & codes",
    faqs: [
      { question: "Are trailing incomplete percent codes handled safely?", answer: "Yes, our decoder isolates incomplete fragments to avoid browser runtime execution errors." },
    ],
    relatedTools: ["url-encoder", "base64-decoder"],
  },
  // 9. JWT Decoder
  {
    id: "jwt-decoder",
    title: "JWT Decoder",
    description: "Examine JSON Web Token payloads, algorithms, and timestamps immediately in a formatted presentation.",
    category: "developer",
    subcategory: "encoding",
    slug: "jwt-decoder",
    status: "Live",
    tag: "🔥",
    metaTitle: "Free online JWT Decoder & Payload Inspector | Comparlify",
    metaDescription: "Inspect header, payload, and claim fields inside JSON Web Tokens (JWT). Decode standard tokens securely with complete privacy.",
    whatIsIt: "The JWT Decoder splits a standard JSON Web Token into its Header, Payload, and Signature parts, decoding the Base64URL encoding to reveal JSON data, active claims, and token expiration dates.",
    howToUse: "Paste a complete JWT (separated by dots). The decoder visualizes standard fields, metadata, expiration times, and JSON properties instantly.",
    faqs: [
      { question: "Is my secret key or token secure?", answer: "Absolutely. Everything is run completely inside your local browser sandbox. The token payload never touches external web servers." },
      { question: "Does this verify the JWT signature?", answer: "This tool is a visual decoder. It extracts metadata and payloads but does not validate signatures, as cryptographic validation requires a server-side secret key." },
    ],
    relatedTools: ["base64-decoder", "regex-tester"],
  },
  // 10. UUID Generator
  {
    id: "uuid-generator",
    title: "UUID Generator",
    description: "Generate universally unique identifiers (UUIDs) compliant with RFC 4122 v4 specifications.",
    category: "developer",
    subcategory: "generators",
    slug: "uuid-generator",
    status: "Live",
    tag: "High",
    metaTitle: "Bulk RFC 4122 UUID v4 Generator Online | Comparlify",
    metaDescription: "Generate single or batch cryptographically secure UUID v4 strings instantly. Fully compliant UUID tools for API testing and system integration.",
    whatIsIt: "Our UUID Generator generates standard v4 random numbers with 122 bits of entropy, giving you distinct tokens with essentially zero risk of collision.",
    howToUse: "Specify the quantity of UUIDs needed, choose lower/uppercase format, and click 'Generate'. Use bulk copy to import into database seeds.",
    example: "UUID v4: f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
    faqs: [
      { question: "How random are these UUIDs?", answer: "They use the browser's high-entropy Web Cryptography API (`crypto.getRandomValues`) to ensure high entropy." },
    ],
    relatedTools: ["password-generator"],
  },
  // 11. Password Generator
  {
    id: "password-generator",
    title: "Password Generator",
    description: "Build secure, customizable, cryptographically sound passwords with customizable length and character filters.",
    category: "developer",
    subcategory: "generators",
    slug: "password-generator",
    status: "Live",
    tag: "High",
    metaTitle: "Secure Password Generator Online | Comparlify",
    metaDescription: "Create strong, customized, cryptographically secure passwords. Adjust character types, length, and exclude confusing symbols instantly.",
    whatIsIt: "The Password Generator leverages Web Crypto APIs to compile extremely strong randomized characters, providing reliable local password setups.",
    howToUse: "Select your desired length, check checkboxes for lowercase, uppercase, numbers, and symbols, and press Generate.",
    faqs: [
      { question: "Is it safe to generate credentials on the web?", answer: "Yes, because our system runs exclusively in-browser. No generation requests are logged, and nothing is transmitted over the internet." },
    ],
    relatedTools: ["uuid-generator"],
  },
  // 12. Regex Tester
  {
    id: "regex-tester",
    title: "Regex Tester",
    description: "Input regular expressions and test strings to see matches, capture groups, and capture positions in real-time.",
    category: "developer",
    subcategory: "testing",
    slug: "regex-tester",
    status: "Live",
    tag: "🔥",
    metaTitle: "Interactive Regex Tester & Highlighter | Comparlify",
    metaDescription: "Test regular expressions with real-time match highlighting, group tracking, and regex flag configurations in an elegant testing playground.",
    whatIsIt: "The Regex Tester provides an interactive environment to evaluate regular expressions against body text, tracking matches and parenthetical grouping.",
    howToUse: "Enter your regular expression pattern, specify flags (like global, case-insensitive, or multiline), and input body text to view highlighted matches.",
    faqs: [
      { question: "Which Regex engine is used?", answer: "This tool uses the standard V8 engine JavaScript RegExp implementation directly." },
    ],
    relatedTools: ["jwt-decoder"],
  },
  // 13. HTML Formatter
  {
    id: "html-formatter",
    title: "HTML Formatter",
    description: "Beautify, clean, and properly indent nested HTML elements and embedded styles.",
    category: "developer",
    subcategory: "formatters",
    slug: "html-formatter",
    status: "Live",
    tag: "High",
    metaTitle: "Free HTML Formatter & Markup Beautifier | Comparlify",
    metaDescription: "Clean up and align raw HTML code. Set custom tab sizes, fix missing tags, and structure complex DOM hierarchies effortlessly.",
    whatIsIt: "The HTML Formatter restores nested indentations and clean line structures to raw, compressed, or disorganized HTML templates.",
    howToUse: "Paste HTML markup, pick your preferred indentation width, and run the formatter for immediate visual hierarchy.",
    faqs: [
      { question: "Does this format inline scripts or styles?", answer: "Yes, standard inline script blocks or styles are formatted in line with the surrounding HTML structure." },
    ],
    relatedTools: ["css-formatter", "javascript-formatter"],
  },
  // 14. CSS Formatter
  {
    id: "css-formatter",
    title: "CSS Formatter",
    description: "Align stylesheet declarations, selectors, curly brackets, and nested media queries for maximum readability.",
    category: "developer",
    subcategory: "formatters",
    slug: "css-formatter",
    status: "Live",
    tag: "High",
    metaTitle: "Online CSS Formatter & Style Beautifier | Comparlify",
    metaDescription: "Clean up disorganized CSS stylesheets. Beautiful, standard indentation spacing for classes, rules, and advanced responsive media blocks.",
    whatIsIt: "The CSS Formatter cleans up stylesheets, organizing rules, curly bracket nests, and indentation spacing for easy maintenance.",
    howToUse: "Paste CSS, select formatting variables, and execute to obtain a clean style sheet.",
    faqs: [
      { question: "Does it support nested CSS rules?", answer: "Yes, it formats modern nested selectors and Media/Container Queries perfectly." },
    ],
    relatedTools: ["html-formatter", "yaml-formatter"],
  },
  // 15. JS Formatter
  {
    id: "javascript-formatter",
    title: "JavaScript Formatter",
    description: "Format, clean, and properly align JavaScript or TypeScript code snippets.",
    category: "developer",
    subcategory: "formatters",
    slug: "javascript-formatter",
    status: "Live",
    tag: "High",
    metaTitle: "JavaScript & TypeScript Code Formatter Online | Comparlify",
    metaDescription: "Format and beautify JS/TS scripts instantly in your browser. Set tab spacing, clean brace styles, and standardize indentation.",
    whatIsIt: "The JavaScript Formatter structures complex scripts with uniform brace placements, proper tabs, and clean variable definitions.",
    howToUse: "Input your raw JavaScript block, choose indentation styles, and click Format.",
    faqs: [
      { question: "Does this check for runtime JavaScript bugs?", answer: "No, it focuses purely on visual spacing and brace styling rather than static code analysis." },
    ],
    relatedTools: ["html-formatter", "sql-formatter"],
  },
  // 16. SQL Formatter
  {
    id: "sql-formatter",
    title: "SQL Formatter",
    description: "Format complex SQL queries with uniform keyword capitalization, logical indentation, and table alignments.",
    category: "developer",
    subcategory: "formatters",
    slug: "sql-formatter",
    status: "Live",
    tag: "🔥",
    metaTitle: "Free SQL Query Formatter & Beautifier | Comparlify",
    metaDescription: "Format messy SQL statements. Features logical indentation, capitalized commands, and clean line nesting for SELECT/JOIN statements.",
    whatIsIt: "Leverages the advanced `sql-formatter` library to structure queries for PostgreSQL, MySQL, SQL Server, and other SQL dialects, elevating keywords like SELECT, JOIN, and WHERE to clean uppercase structures.",
    howToUse: "Paste your raw query string, select SQL dialect parameters, and run formatting.",
    example: "Input: select id,name from users where id=5 order by id\nOutput: SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  id = 5\nORDER BY\n  id",
    faqs: [
      { question: "Which SQL dialects are supported?", answer: "All standard SQL databases like PostgreSQL, MySQL, SQLite, Oracle, and MariaDB are supported." },
    ],
    relatedTools: ["javascript-formatter", "xml-formatter"],
  },
  // 17. XML Formatter
  {
    id: "xml-formatter",
    title: "XML Formatter",
    description: "Structure raw XML strings with standard tags, indents, and clean hierarchy setups.",
    category: "developer",
    subcategory: "formatters",
    slug: "xml-formatter",
    status: "Live",
    tag: "High",
    metaTitle: "Free online XML Formatter & Beautifier | Comparlify",
    metaDescription: "Beautify, indent, and format raw XML documents. Features syntax verification, self-closing tag formats, and precise nested indent sizes.",
    whatIsIt: "The XML Formatter reads raw XML payloads and aligns node namespaces, parent-child levels, and attributes for visual clarity.",
    howToUse: "Enter raw XML, select an indent level, and view formatted output instantly.",
    faqs: [
      { question: "Will it handle invalid XML namespaces?", answer: "Yes, it reports unclosed nodes or broken namespaces during parsing." },
    ],
    relatedTools: ["sql-formatter", "yaml-formatter"],
  },
  // 18. YAML Formatter
  {
    id: "yaml-formatter",
    title: "YAML Formatter",
    description: "Format, beautify, and validate YAML files. Clean up spacing and list structures.",
    category: "developer",
    subcategory: "formatters",
    slug: "yaml-formatter",
    status: "Live",
    tag: "High",
    metaTitle: "YAML Formatter & Indent Checker Online | Comparlify",
    metaDescription: "Format and align YAML configuration files. Clean up list structures, nested dictionary spaces, and prevent syntax parser errors.",
    whatIsIt: "Our YAML Formatter checks key-value spaces and structures, helping developers avoid common indentation mistakes in configuration files.",
    howToUse: "Paste YAML code and format for aligned elements.",
    faqs: [
      { question: "Why are indentation rules so strict in YAML?", answer: "YAML uses white space indentation rather than brackets to define scope, meaning single extra spaces can alter configurations." },
    ],
    relatedTools: ["xml-formatter", "json-formatter"],
  },
  // 19. Unix Timestamp Converter
  {
    id: "unix-timestamp-converter",
    title: "Unix Timestamp Converter",
    description: "Convert Unix epoch timestamps to human-readable ISO/UTC dates, and vice versa.",
    category: "developer",
    subcategory: "converters",
    slug: "unix-timestamp-converter",
    status: "Live",
    tag: "High",
    metaTitle: "Unix Epoch Timestamp Converter Online | Comparlify",
    metaDescription: "Convert Unix epoch timestamps (seconds & milliseconds) to clean local, UTC, and ISO dates, and convert calendar dates back to Unix times.",
    whatIsIt: "Translates standard integer timestamps (seconds elapsed since Jan 1, 1970) into fully localized ISO-8601 calendar strings.",
    howToUse: "Type a Unix integer timestamp (seconds or milliseconds) to view the equivalent ISO, UTC, and local calendar date. Or do the reverse by inputting a calendar date.",
    example: "1710000000 -> 2024-03-09T16:00:00.000Z",
    faqs: [
      { question: "Does it detect milliseconds?", answer: "Yes, the converter automatically detects whether you're using seconds (10 digits) or milliseconds (13 digits) and formats correctly." },
    ],
    relatedTools: ["uuid-generator"],
  },
  // 20. Cron Expression Generator
  {
    id: "cron-expression-generator",
    title: "Cron Expression Generator",
    description: "Build cron schedule strings with an easy-to-use interface, or decode existing cron strings into clear English.",
    category: "developer",
    subcategory: "generators",
    slug: "cron-generator",
    status: "Live",
    tag: "🔥",
    metaTitle: "Interactive Cron Expression Generator & Decoder | Comparlify",
    metaDescription: "Generate standard 5-part cron expressions via simple drop-down menus, and decode existing cron formats into human-readable descriptions.",
    whatIsIt: "A developer utility that bridges standard scheduling syntaxes and English explanations. It lets you construct cron expressions via forms and explains existing schedules clearly.",
    howToUse: "Pick your schedules (hours, days, months), and click Generate to view your standard cron string. Paste a cron string into the decoder to see its English explanation.",
    example: "0 12 * * * -> 'At 12:00 PM every day'",
    faqs: [
      { question: "Is this compliant with standard crontab configurations?", answer: "Yes, it creates compliant five-part expressions compatible with all Linux and cloud cron configurations." },
    ],
    relatedTools: ["unix-timestamp-converter"],
  },

  // ── PDF TOOLS ──
  // 21. Merge PDF
  {
    id: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDF documents into a single, unified file. Reorder pages and files instantly.",
    category: "pdf",
    slug: "merge",
    status: "Live",
    tag: "🔥",
    metaTitle: "Merge PDF Files Online - Free PDF Joiner | Comparlify",
    metaDescription: "Merge and combine multiple PDF files in your browser. Arrange files in order and combine them securely with 100% privacy.",
    whatIsIt: "A browser-based utility using `pdf-lib` to load multiple PDF binary packages and merge them into one output without exposing private documents to external servers.",
    howToUse: "Upload two or more PDF files, drag or move them to adjust merge ordering, and click 'Merge PDF'.",
    faqs: [
      { question: "Is there a limit on how many files I can merge?", answer: "You can merge up to 50 files or 150MB of data comfortably in-browser." },
    ],
    relatedTools: ["split-pdf", "compress-pdf"],
  },
  // 22. Split PDF
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Split a PDF file into separate pages or extract specific page ranges (e.g., pages 2-4).",
    category: "pdf",
    slug: "split",
    status: "Live",
    tag: "🔥",
    metaTitle: "Split PDF Online - Split PDF Pages Free | Comparlify",
    metaDescription: "Split PDF documents into separate files. Extract single pages or custom page ranges instantly with zero-server storage.",
    whatIsIt: "Splits a PDF document using `pdf-lib` to isolate specific pages or write separate PDF files for individual pages.",
    howToUse: "Upload a PDF, configure the split settings (e.g. 'Pages 1-3' or 'All pages'), and click 'Split PDF'.",
    faqs: [
      { question: "Can I extract specific page ranges?", answer: "Yes, you can specify ranges like '1-3' or select individual page indexes." },
    ],
    relatedTools: ["merge-pdf", "extract-pages-pdf"],
  },
  // 23. Compress PDF
  {
    id: "compress-pdf",
    title: "Compress PDF",
    description: "Reduce PDF document size securely. Clean up structural streams and downscale embedded images.",
    category: "pdf",
    slug: "compress",
    status: "Live",
    tag: "🔥",
    metaTitle: "Compress PDF Online - Reduce PDF File Size Free | Comparlify",
    metaDescription: "Reduce the file size of your PDF documents securely. Downscale embedded images and compress document structures in your browser.",
    whatIsIt: "Compresses PDFs by rebuilding internal objects and downscaling images through client-side compression loops.",
    howToUse: "Upload a PDF, choose the compression level (e.g., standard or high), and download the optimized PDF.",
    faqs: [
      { question: "Will compressing affect text quality?", answer: "No, text remains fully vector-based and crisp. Image-heavy files see the greatest compression benefits." },
    ],
    relatedTools: ["merge-pdf", "pdf-to-jpg"],
  },
  // 24. JPG → PDF
  {
    id: "jpg-to-pdf",
    title: "JPG to PDF",
    description: "Convert JPG, JPEG, and PNG images into a clean, unified PDF document in seconds.",
    category: "pdf",
    slug: "jpg-to-pdf",
    status: "Live",
    tag: "🔥",
    metaTitle: "Convert JPG to PDF Online Free | Comparlify",
    metaDescription: "Convert and pack JPG, JPEG, and PNG images into a single PDF document in your browser. Free, secure, and instant conversion.",
    whatIsIt: "Loads images into client-side canvases, drawing them directly into a fresh PDF container with customized scaling.",
    howToUse: "Upload one or more images, reorder them, adjust margins or page orientation, and download the compiled PDF.",
    faqs: [
      { question: "Does it support PNG format?", answer: "Yes, you can mix and match JPG, JPEG, and PNG images in the same document." },
    ],
    relatedTools: ["pdf-to-jpg", "pdf-to-png"],
  },
  // 25. PDF → JPG
  {
    id: "pdf-to-jpg",
    title: "PDF to JPG",
    description: "Convert PDF pages into high-fidelity, standalone JPG images completely in your browser.",
    category: "pdf",
    slug: "pdf-to-jpg",
    status: "Live",
    tag: "🔥",
    metaTitle: "Convert PDF to JPG Online - Extract PDF Pages to Images | Comparlify",
    metaDescription: "Convert PDF documents to JPG images free. Render PDF pages as high-resolution JPG images inside your browser with complete privacy.",
    whatIsIt: "Renders PDF pages directly onto canvas elements using `pdfjs-dist` and exports them as high-quality JPG files.",
    howToUse: "Upload a PDF, select the quality or specific pages, and download individual pages as JPGs or download them grouped in a single ZIP file.",
    faqs: [
      { question: "Can I download all pages as a single ZIP?", answer: "Yes, our tool automatically generates and packages the images inside a single ZIP file." },
    ],
    relatedTools: ["jpg-to-pdf", "pdf-to-png"],
  },
  // 26. PDF → PNG
  {
    id: "pdf-to-png",
    title: "PDF to PNG",
    description: "Convert PDF pages into crisp, transparent PNG images.",
    category: "pdf",
    slug: "pdf-to-png",
    status: "Live",
    tag: "High",
    metaTitle: "Convert PDF to PNG Online - Free High-Res Converter | Comparlify",
    metaDescription: "Convert PDF pages into transparent PNG images. High-fidelity rendering and client-side conversion for maximum privacy.",
    whatIsIt: "Renders PDF vector streams onto high-definition canvases and exports them as lossless PNG images.",
    howToUse: "Upload your PDF file, preview pages, select page ranges, and download as PNGs or a single ZIP file.",
    faqs: [
      { question: "Why choose PNG over JPG?", answer: "PNG offers lossless quality and supports transparency, making it ideal for diagrams and high-contrast text." },
    ],
    relatedTools: ["pdf-to-jpg", "jpg-to-pdf"],
  },
  // 27. PDF → Text
  {
    id: "pdf-to-text",
    title: "PDF to Text",
    description: "Extract raw, readable text content from standard text-based PDF documents.",
    category: "pdf",
    slug: "pdf-to-text",
    status: "Live",
    tag: "High",
    metaTitle: "Extract Text from PDF Online - PDF to Text Converter | Comparlify",
    metaDescription: "Extract text from PDF files. Free online tool to copy and download text from your PDF pages instantly with 100% privacy.",
    whatIsIt: "Iterates through the text layers of PDF pages using `pdfjs-dist` to reconstruct paragraph structures and return raw text.",
    howToUse: "Upload a PDF file and watch the extracted text content render in the editor. Copy or save the file.",
    faqs: [
      { question: "Can it extract text from scanned PDFs?", answer: "This tool extracts text from selectable text layers. Scanned images without OCR (Optical Character Recognition) metadata are not supported." },
    ],
    relatedTools: ["pdf-to-jpg"],
  },
  // 28. PDF Rotator
  {
    id: "pdf-rotator",
    title: "PDF Rotator",
    description: "Rotate individual or all pages inside a PDF document and export the corrected PDF.",
    category: "pdf",
    slug: "rotate",
    status: "Live",
    tag: "High",
    metaTitle: "Rotate PDF Online - Free PDF Page Rotator | Comparlify",
    metaDescription: "Rotate PDF pages 90, 180, or 270 degrees. Correct upside-down or landscape PDFs in your browser with complete security.",
    whatIsIt: "Adjusts the `rotation` attributes of individual pages inside a PDF container via `pdf-lib`.",
    howToUse: "Upload your PDF, select pages, choose a rotation angle, and download.",
    faqs: [
      { question: "Does it permanently save the rotation?", answer: "Yes, the rotation metadata is written directly into the PDF structure, so it displays correctly on all devices." },
    ],
    relatedTools: ["merge-pdf", "delete-pages-pdf"],
  },
  // 29. PDF Page Extractor
  {
    id: "extract-pages-pdf",
    title: "PDF Page Extractor",
    description: "Extract specific pages from a PDF document to create a brand-new PDF file.",
    category: "pdf",
    slug: "extract-pages",
    status: "Live",
    tag: "High",
    metaTitle: "Extract PDF Pages Online - Free Page Extractor | Comparlify",
    metaDescription: "Extract specific pages from any PDF document to create a new PDF file instantly. Safe, secure, and 100% browser-based.",
    whatIsIt: "Copies specific page instances from a source PDF document into a fresh PDF file.",
    howToUse: "Upload your PDF, enter or select the pages you want to keep, and download the new PDF.",
    faqs: [
      { question: "Is this different from Split PDF?", answer: "Split PDF splits the document into multiple files, while Extractor focuses on saving a specific subset of pages as a single new PDF." },
    ],
    relatedTools: ["split-pdf", "delete-pages-pdf"],
  },
  // 30. PDF Page Deleter
  {
    id: "delete-pages-pdf",
    title: "PDF Page Deleter",
    description: "Remove specific or unwanted pages from a PDF document and download the cleaned version.",
    category: "pdf",
    slug: "delete-pages",
    status: "Live",
    tag: "High",
    metaTitle: "Delete PDF Pages Online - Remove PDF Pages Free | Comparlify",
    metaDescription: "Remove unwanted pages from a PDF document. Safe, secure, and 100% browser-based page deletion with no server uploads.",
    whatIsIt: "Uses `pdf-lib` to delete page indexes from the document tree structure, and outputs a cleaned version.",
    howToUse: "Upload your PDF, click to deselect/delete specific pages, and download the cleaned PDF.",
    faqs: [
      { question: "Can I recover deleted pages later?", answer: "Once downloaded, the pages are permanently removed. Keep your original PDF file if you need those pages later." },
    ],
    relatedTools: ["extract-pages-pdf", "split-pdf"],
  },

  // ── MIGRATED/LEGACY CALCULATORS & CREATOR TOOLS ──
  {
    id: "pricing-calculator",
    title: "Pricing Calculator",
    description: "Calculate your true profit by comparing Teachable, Kajabi, Podia, and more with our real-time fee engine.",
    category: "calculators",
    subcategory: "strategic",
    slug: "pricing",
    status: "Strategic Tool",
    tag: "New",
    metaTitle: "True Profit & Pricing Calculator | Comparlify",
    metaDescription: "Calculate your true margins after accounting for platform fees.",
    whatIsIt: "Legacy pricing calculator to spot hidden subscription and transaction fees.",
    howToUse: "Fill in your active transaction numbers and product prices.",
    faqs: [],
    legacyComponent: "PricingCalculator",
  },
  {
    id: "roi-calculator",
    title: "Savings Calculator",
    description: "Compare transaction fees vs. flat monthly costs. Find your cheapest infrastructure option.",
    category: "calculators",
    subcategory: "strategic",
    slug: "roi",
    status: "Best for Savings",
    tag: "Live",
    metaTitle: "ROI & Platform Savings Calculator | Comparlify",
    metaDescription: "Compare transaction fees vs monthly subscriptions.",
    whatIsIt: "Calculates the tipping points between pay-as-you-go vs flat pricing models.",
    howToUse: "Input active parameters to see cost curves.",
    faqs: [],
    legacyComponent: "RoiCalculator",
  },
  {
    id: "course-revenue-calculator",
    title: "Revenue Calculator",
    description: "Calculate your net profit after platform fees. Compare Teachable vs Kajabi margins for your next launch.",
    category: "calculators",
    subcategory: "strategic",
    slug: "revenue",
    status: "Revenue Tool",
    tag: "New",
    metaTitle: "Course Launch Revenue Calculator | Comparlify",
    metaDescription: "Calculate net margins from multi-tiered launches.",
    whatIsIt: "Helps creators understand the net profit left after standard fees.",
    howToUse: "Provide sales projections to map income splits.",
    faqs: [],
    legacyComponent: "CourseRevenueCalculator",
  },
  {
    id: "stack-optimizer",
    title: "Subscription Audit",
    description: "Check for redundant subscriptions. Save money by removing overlapping features.",
    category: "calculators",
    subcategory: "strategic",
    slug: "subscription-audit",
    status: "Audit Tool",
    tag: "Live",
    metaTitle: "Tech Stack Optimizer & Subscription Auditor | Comparlify",
    metaDescription: "Identify redundant tools and subscription leaks.",
    whatIsIt: "Audits your digital software spend for features that overlap across platforms.",
    howToUse: "Select your existing software stack components.",
    faqs: [],
    legacyComponent: "StackOptimizer",
  },
  {
    id: "churn-forecaster",
    title: "Retention Forecaster",
    description: "See how student retention affects your long-term income. Plan your growth with math.",
    category: "calculators",
    subcategory: "strategic",
    slug: "retention-forecaster",
    status: "Growth Tool",
    tag: "Live",
    metaTitle: "Student Retention & Churn Forecaster | Comparlify",
    metaDescription: "Model growth loops and calculate compounding cohort decay.",
    whatIsIt: "Simulates cohort membership retention trends over 12-60 month horizons.",
    howToUse: "Adjust initial price, members, and monthly churn rates.",
    faqs: [],
    legacyComponent: "ChurnForecaster",
  },
  {
    id: "ad-profit-predictor",
    title: "Ad ROI Predictor",
    description: "Calculate the exact profit of your ads. Know your break-even point before you scale.",
    category: "calculators",
    subcategory: "strategic",
    slug: "ad-roi-predictor",
    status: "Scaling",
    tag: "Live",
    metaTitle: "Paid Traffic & Ad ROI Predictor | Comparlify",
    metaDescription: "Identify true CPA caps and conversion thresholds.",
    whatIsIt: "Calculates the mathematical thresholds for running profitable social ads.",
    howToUse: "Enter ad spend, click rates, and funnel conversions.",
    faqs: [],
    legacyComponent: "AdProfitPredictor",
  },
  {
    id: "creator-match",
    title: "Software Matchmaker",
    description: "Find the perfect software for your business based on your budget and technical needs.",
    category: "calculators",
    subcategory: "strategic",
    slug: "matchmaker",
    status: "Recommended",
    tag: "New",
    metaTitle: "Tech Stack Matchmaker | Comparlify",
    metaDescription: "Personalized recommendation wizard based on feature preferences.",
    whatIsIt: "Interactive question-driven matchmaker.",
    howToUse: "Step through the features list to get a structured rank.",
    faqs: [],
    legacyComponent: "CreatorMatch",
  },
  {
    id: "stack-architect",
    title: "Tech Stack Planner",
    description: "Plan your entire software suite (Courses + Email + Community). Spot gaps instantly.",
    category: "calculators",
    subcategory: "strategic",
    slug: "stack-planner",
    status: "Planning",
    tag: "Live",
    metaTitle: "Tech Stack Architect & Builder | Comparlify",
    metaDescription: "Design, audit, and configure unified infrastructure blueprints.",
    whatIsIt: "Blueprint builder for creators to visualize software integrations.",
    howToUse: "Link nodes representing different system layers.",
    faqs: [],
    legacyComponent: "StackArchitect",
  },

  // ── IMAGE TOOLS ──
  // 41. Image Compressor
  {
    id: "image-compressor",
    title: "Image Compressor",
    description: "Compress, optimize, and shrink JPG, PNG, and WebP images. Set custom target sizes or select balanced quality presets with complete local privacy.",
    category: "image",
    slug: "compressor",
    status: "Live",
    tag: "🔥",
    metaTitle: "Free Image Compressor & Optimizer Online | Comparlify",
    metaDescription: "Compress and optimize your JPG, PNG, and WebP images instantly in-browser. Minimize size without losing quality using smart compression algorithms.",
    whatIsIt: "The Image Compressor is a premium client-side utility that structures high-performance image compression using standard HTML5 Canvas rendering logic. It handles large-format graphic payloads securely.",
    howToUse: "Upload your image, choose your desired quality target (Best Quality, Balanced, Smallest File, or Target Size), preview real-time visual output comparison, and download the compressed file.",
    faqs: [
      { question: "Is my image data secure?", answer: "Yes, 100%. All compression routines run entirely in-browser inside your device RAM. Your private photos never touch a remote web server." },
      { question: "How does Target Size mode work?", answer: "Target Size mode performs an optimized client-side binary search across multiple quality coefficients to automatically yield the highest visual rendering that fits beneath your requested kilobyte target." }
    ],
    relatedTools: ["image-resizer", "image-cropper", "jpg-to-png"]
  },
  // 42. Image Resizer
  {
    id: "image-resizer",
    title: "Image Resizer",
    description: "Resize images to exact dimensions in pixels or percentages. Maintain aspect ratios and apply smart presets.",
    category: "image",
    slug: "resizer",
    status: "Live",
    tag: "🔥",
    metaTitle: "Bulk Image Resizer Online - Change Image Dimensions | Comparlify",
    metaDescription: "Resize your images to custom pixel dimensions or percentages instantly in your browser. Maintain aspect ratio and use crop settings for pixel-perfect results.",
    whatIsIt: "A versatile dimension controller that updates height and width properties on a canvas object, exporting pristine resized files with bilinear resampling quality.",
    howToUse: "Drag and drop your images, key in width or height (or toggle absolute aspect locking), and download the resized versions instantly.",
    faqs: [
      { question: "Can I resize multiple images at once?", answer: "Yes, our workspace supports bulk operations. You can upload up to 50 images and apply global resizing boundaries simultaneously." }
    ],
    relatedTools: ["image-compressor", "image-cropper"]
  },
  // 43. Image Cropper
  {
    id: "image-cropper",
    title: "Image Cropper",
    description: "Crop your images with precision. Choose custom aspect ratios or standard web presets.",
    category: "image",
    slug: "cropper",
    status: "Live",
    tag: "🔥",
    metaTitle: "Interactive Image Cropping Tool Online | Comparlify",
    metaDescription: "Crop images quickly to any custom dimension or predefined aspect ratios like 16:9, 4:3, or square. 100% browser-based with high-definition rendering.",
    whatIsIt: "An interactive viewport utility allowing users to clip specific bounds from raw images, outputting clean canvas-cropped graphics without compression noise.",
    howToUse: "Upload your file, adjust the interactive crop guides, choose an aspect lock if desired, and click Apply Crop.",
    faqs: [
      { question: "Can I export my cropped file in a different format?", answer: "Absolutely. Once cropped, you can leverage the conversion tools within the same workspace to export as PNG, WebP, or JPG." }
    ],
    relatedTools: ["image-resizer", "image-rotator"]
  },
  // 44. Image Rotator
  {
    id: "image-rotator",
    title: "Image Rotator",
    description: "Rotate images 90, 180, or 270 degrees, or flip them horizontally and vertically.",
    category: "image",
    slug: "rotator",
    status: "Live",
    tag: "🔥",
    metaTitle: "Rotate & Flip Images Online - Correct Orientation | Comparlify",
    metaDescription: "Rotate images 90, 180, or 270 degrees clockwise or counterclockwise. Flip images vertically and horizontally with instant preview and local download.",
    whatIsIt: "A lightweight metadata and canvas orientation tuner that applies geometric rotations to uploaded graphics with lossless pixel integrity.",
    howToUse: "Select your image file, click rotation buttons or flip switches, and export instantly.",
    faqs: [
      { question: "Does rotating degrade image quality?", answer: "No, canvas rotation is a lossless matrix operation. The original pixel properties are preserved completely." }
    ],
    relatedTools: ["image-cropper", "image-resizer"]
  },
  // 45. JPG to PNG Converter
  {
    id: "jpg-to-png",
    title: "JPG to PNG Converter",
    description: "Convert JPG images to PNG format with high fidelity. Retain complete color depth.",
    category: "image",
    slug: "jpg-to-png",
    status: "Live",
    metaTitle: "Convert JPG to PNG Online Free | Comparlify",
    metaDescription: "Convert JPG images to PNG format instantly inside your browser. High-fidelity client-side conversion ensures complete data privacy and zero quality loss.",
    whatIsIt: "An in-browser image translation filter that converts lossy JPEG images into standard lossless PNG files.",
    howToUse: "Upload one or more JPG files, configure target options if desired, and download the PNG file or compressed ZIP folder.",
    faqs: [
      { question: "Why convert JPG to PNG?", answer: "PNG supports lossless editing and alpha transparency, making it much better for layering in design applications." }
    ],
    relatedTools: ["png-to-jpg", "jpg-to-webp"]
  },
  // 46. PNG to JPG Converter
  {
    id: "png-to-jpg",
    title: "PNG to JPG Converter",
    description: "Convert transparent PNG files to optimized flat JPG images with customizable backgrounds.",
    category: "image",
    slug: "png-to-jpg",
    status: "Live",
    metaTitle: "Convert PNG to JPG Online Free | Comparlify",
    metaDescription: "Convert PNG files to optimized JPG format instantly in-browser. Customize transparency background colors and download highly-compressed JPEG files.",
    whatIsIt: "Redraws PNG assets over custom background fills (defaulting to white) and serializes them to standard JPEG formats.",
    howToUse: "Drag in your PNGs, choose background color overrides for transparent channels, and download.",
    faqs: [
      { question: "What happens to my PNG transparency?", answer: "Since the JPEG standard doesn't support alpha transparency, transparent areas are blended onto your chosen flat background color." }
    ],
    relatedTools: ["jpg-to-png", "png-to-webp"]
  },
  // 47. JPG to WebP Converter
  {
    id: "jpg-to-webp",
    title: "JPG to WebP Converter",
    description: "Convert standard JPG files into modern, highly-compressed WebP images to boost website page speed.",
    category: "image",
    slug: "jpg-to-webp",
    status: "Live",
    metaTitle: "Convert JPG to WebP Online - Next-Gen Image Format | Comparlify",
    metaDescription: "Convert JPG files to Google's next-generation WebP format. Drastically reduce web page loads with high compression efficiency.",
    whatIsIt: "A modern web-performance utility translating JPEG assets into next-generation WebP files for streamlined web loading times.",
    howToUse: "Drop your JPG files into the interface and convert instantly. Ideal for WordPress, Shopify, and Next.js assets.",
    faqs: [
      { question: "Is WebP universally supported?", answer: "Yes, all modern web browsers (Chrome, Safari, Firefox, Edge) fully support the WebP format." }
    ],
    relatedTools: ["jpg-to-png", "webp-to-jpg"]
  },
  // 48. PNG to WebP Converter
  {
    id: "png-to-webp",
    title: "PNG to WebP Converter",
    description: "Convert high-resolution PNGs into optimized transparent WebP images.",
    category: "image",
    slug: "png-to-webp",
    status: "Live",
    metaTitle: "Convert PNG to WebP Online Free | Comparlify",
    metaDescription: "Convert PNG files to WebP format while preserving transparency. Reduce PNG file size up to 80% with next-generation web optimization.",
    whatIsIt: "Exports transparent PNGs into highly compressed transparent WebP packages, preserving alpha layers with modern vector efficiency.",
    howToUse: "Upload transparent or standard PNG files and save the optimized WebP assets.",
    faqs: [
      { question: "Does PNG to WebP preserve transparency?", answer: "Yes, WebP fully supports alpha-channel transparency at significantly reduced file footprints." }
    ],
    relatedTools: ["png-to-jpg", "webp-to-jpg"]
  },
  // 49. WebP to JPG Converter
  {
    id: "webp-to-jpg",
    title: "WebP to JPG Converter",
    description: "Convert modern WebP images back into widely compatible standard JPG format.",
    category: "image",
    slug: "webp-to-jpg",
    status: "Live",
    metaTitle: "Convert WebP to JPG Online Free | Comparlify",
    metaDescription: "Convert WebP images back to standard JPG format instantly in-browser. Wide compatibility translation for offline editing and legacy programs.",
    whatIsIt: "Translates WebP files into universally supported JPEG streams to ensure compatibility on legacy devices and software.",
    howToUse: "Upload WebP files, trigger local translation, and download high-compatibility JPG outputs.",
    faqs: [
      { question: "Will WebP to JPG increase file size?", answer: "Yes, because JPEG is less efficient than WebP, the same image in JPG format may have a larger file footprint." }
    ],
    relatedTools: ["jpg-to-webp", "png-to-webp"]
  },
  // 50. Image to Base64 Encoder
  {
    id: "image-to-base64",
    title: "Image to Base64 Converter",
    description: "Convert any image file into an ASCII Base64 data URI string for direct embedding in HTML or CSS.",
    category: "image",
    slug: "image-to-base64",
    status: "Live",
    tag: "🔥",
    metaTitle: "Image to Base64 Encoder Online - Embed Images Directly | Comparlify",
    metaDescription: "Convert JPG, PNG, WebP, SVG, or GIF images into standard Base64 Data URI strings instantly. Perfect for offline embedding in HTML, CSS, or JSON packages.",
    whatIsIt: "An encoding scanner converting image binaries into standard MIME-typed RFC 4648 data URIs.",
    howToUse: "Select an image and copy the generated Base64 block as a standard CSS source or raw HTML image embed.",
    faqs: [
      { question: "Does Base64 increase file size?", answer: "Yes, encoding binary data into Base64 ASCII characters adds approximately 33% overhead to the file size." }
    ],
    relatedTools: ["base64-encoder", "image-compressor"]
  },

  // ── TEXT TOOLS ──
  // 31. Word Counter
  {
    id: "word-counter",
    title: "Word Counter",
    description: "Count words, characters, sentences, paragraphs, reading time, speaking time, and check social media character limits in real-time.",
    category: "text",
    slug: "word-counter",
    status: "Live",
    tag: "🔥",
    metaTitle: "Free Word & Character Counter Online | Comparlify",
    metaDescription: "Count words, characters, sentences, and paragraphs in real-time. Inspect social media character limits, reading time, and keyword density.",
    whatIsIt: "An interactive text metrics analyzer providing instant statistics for content creators, copywriters, and developers.",
    howToUse: "Paste or type your text into the editor. View live word counts, character limits for Twitter/LinkedIn, and reading time estimates.",
    faqs: [
      { question: "Is my text saved or sent to a server?", answer: "No, all text analysis is processed 100% locally in your browser. Nothing is transmitted externally." }
    ],
    relatedTools: ["character-counter", "case-converter"]
  },
  // 32. Character Counter
  {
    id: "character-counter",
    title: "Character Counter",
    description: "Count exact characters with and without spaces. Inspect social media limits for X/Twitter, LinkedIn, Meta Title, and Meta Description.",
    category: "text",
    slug: "character-counter",
    status: "Live",
    tag: "🔥",
    metaTitle: "Character Counter Online with Social Media Limits | Comparlify",
    metaDescription: "Count characters with and without spaces. Live limit indicators for Twitter, LinkedIn, SEO titles, and meta descriptions.",
    whatIsIt: "A specialized counter that highlights character boundaries and platform constraints instantly.",
    howToUse: "Input text and monitor the progress bars for Twitter (280 chars), LinkedIn (3,000 chars), Meta Title (60 chars), and Meta Description (160 chars).",
    faqs: [
      { question: "Does it count spaces as characters?", answer: "Yes, our tool shows separate tallies for total characters including spaces and characters excluding whitespace." }
    ],
    relatedTools: ["word-counter", "case-converter"]
  },
  // 33. Case Converter
  {
    id: "case-converter",
    title: "Case Converter",
    description: "Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case, Sentence case, dot.case, and path/case.",
    category: "text",
    slug: "case-converter",
    status: "Live",
    tag: "🔥",
    metaTitle: "Case Converter Online - camelCase, kebab-case, snake_case | Comparlify",
    metaDescription: "Convert text between 9 different casing conventions instantly. Perfect for developers, programmers, and technical copywriters.",
    whatIsIt: "A versatile casing transformation engine converting raw text or identifier strings into developer and publishing conventions.",
    howToUse: "Enter text and click any case conversion button (camelCase, snake_case, kebab-case, Title Case, etc.) to transform instantly.",
    faqs: [
      { question: "Can I convert programming variables?", answer: "Yes, it parses variable names and breaks them into tokens before applying new casing rules." }
    ],
    relatedTools: ["word-counter", "slug-generator"]
  },
  // 34. Remove Duplicate Lines
  {
    id: "remove-duplicate-lines",
    title: "Remove Duplicate Lines",
    description: "Remove duplicate lines from lists or text blocks with case-sensitive or case-insensitive matching options.",
    category: "text",
    slug: "remove-duplicate-lines",
    status: "Live",
    metaTitle: "Remove Duplicate Lines Online | Comparlify",
    metaDescription: "Deduplicate lines in text or code blocks instantly. Supports case sensitivity filters, whitespace normalization, and occurrence preservation.",
    whatIsIt: "A line-by-line deduplication utility that eliminates repetitive entries from lists, logs, or dataset exports.",
    howToUse: "Paste your text block, configure deduplication settings (case sensitive, preserve first/last occurrence), and click Remove Duplicates.",
    faqs: [
      { question: "Does it sort the lines automatically?", answer: "You can choose to preserve original line ordering or combine sorting and deduplication in a single step." }
    ],
    relatedTools: ["remove-empty-lines", "text-sorter"]
  },
  // 35. Remove Empty Lines
  {
    id: "remove-empty-lines",
    title: "Remove Empty Lines",
    description: "Clean up text by removing blank or whitespace-only lines instantly.",
    category: "text",
    slug: "remove-empty-lines",
    status: "Live",
    metaTitle: "Remove Empty & Blank Lines Online | Comparlify",
    metaDescription: "Strip blank lines and whitespace-only lines from text documents, CSV exports, or code snippets instantly in your browser.",
    whatIsIt: "A text sanitizer that scans line breaks and strips empty or space-only lines from text files.",
    howToUse: "Paste your text block and click Remove Empty Lines to clean up vertical whitespace.",
    faqs: [
      { question: "Does it trim trailing whitespace on remaining lines?", answer: "Yes, you can toggle optional whitespace trimming for clean results." }
    ],
    relatedTools: ["remove-duplicate-lines", "text-sorter"]
  },
  // 36. Text Sorter
  {
    id: "text-sorter",
    title: "Text Sorter",
    description: "Sort lines alphabetically, numerically, by line length, or using natural sorting order in ascending or descending order.",
    category: "text",
    slug: "text-sorter",
    status: "Live",
    metaTitle: "Online Text Sorter - Alphabetical & Numerical Sorting | Comparlify",
    metaDescription: "Sort lists and lines alphabetically, numerically, or by line length. Supports natural sorting, reverse order, and case filters.",
    whatIsIt: "A line sorting utility supporting standard ASCII, natural numeric sorting, and character length sorting.",
    howToUse: "Paste lines of text, pick your sorting mode (Alphabetical, Numeric, Length, Natural), choose Ascending/Descending, and run.",
    faqs: [
      { question: "What is Natural Sorting?", answer: "Natural sorting orders numbers logically (e.g. Item 2 comes before Item 10, unlike pure alphabetical sorting)." }
    ],
    relatedTools: ["remove-duplicate-lines", "text-reverser"]
  },
  // 37. Text Reverser
  {
    id: "text-reverser",
    title: "Text Reverser",
    description: "Reverse entire text blocks character by character, word by word, or line by line.",
    category: "text",
    slug: "text-reverser",
    status: "Live",
    metaTitle: "Text Reverser Online - Reverse Words, Lines, Characters | Comparlify",
    metaDescription: "Reverse text character-by-character, word-by-word, or line-by-line instantly. Free, secure, and 100% browser-based.",
    whatIsIt: "A text direction manipulator that flips string indexes at character, word, or sentence/line granularities.",
    howToUse: "Enter text, choose reversing mode (Reverse Characters, Reverse Words, or Reverse Lines), and view output instantly.",
    faqs: [
      { question: "Does it handle Unicode and emoji symbols?", answer: "Yes, unicode surrogate pairs and emojis are handled properly so symbols aren't corrupted." }
    ],
    relatedTools: ["text-sorter", "case-converter"]
  },
  // 38. Text Diff Checker
  {
    id: "text-diff-checker",
    title: "Text Diff Checker",
    description: "Compare two text blocks side-by-side or inline to spot differences, line additions, deletions, and modifications.",
    category: "text",
    slug: "text-diff-checker",
    status: "Live",
    tag: "🔥",
    metaTitle: "Text Diff Checker Online - Compare Two Text Files | Comparlify",
    metaDescription: "Compare two text or code files side-by-side. Highlight additions, deletions, and line-by-line differences with 100% browser privacy.",
    whatIsIt: "A visual comparison engine calculating line-by-line and word-level diffs between an Original and Modified text buffer.",
    howToUse: "Paste original text on the left, modified text on the right, and review the highlighted diff view.",
    faqs: [
      { question: "Is my text uploaded to a server?", answer: "No, diff computation happens strictly in-browser using JavaScript algorithms." }
    ],
    relatedTools: ["find-and-replace", "word-counter"]
  },
  // 39. Find & Replace
  {
    id: "find-and-replace",
    title: "Find & Replace Tool",
    description: "Find and replace text using standard search or regular expressions (Regex) with match highlighting and preview.",
    category: "text",
    slug: "find-and-replace",
    status: "Live",
    tag: "🔥",
    metaTitle: "Online Find & Replace Tool with Regex | Comparlify",
    metaDescription: "Search and replace text strings or regular expressions in real-time. Features case sensitivity, whole-word matching, and live replacement previews.",
    whatIsIt: "A batch string replacement utility supporting standard substrings and V8 RegExp patterns.",
    howToUse: "Input target text, enter search term and replacement string, set options (Match Case, Whole Word, Regex), and click Replace All.",
    faqs: [
      { question: "Does it support Regular Expressions?", answer: "Yes, you can toggle Regex mode to use powerful patterns like capture groups and character classes." }
    ],
    relatedTools: ["text-diff-checker", "case-converter"]
  },
  // 40. Slug Generator
  {
    id: "slug-generator",
    title: "Slug Generator",
    description: "Generate clean, SEO-friendly URL slugs from titles or text. Handles unicode transliteration, stop-word removal, and custom separators.",
    category: "text",
    slug: "slug-generator",
    status: "Live",
    tag: "🔥",
    metaTitle: "SEO Slug Generator Online - Convert Text to URL Slugs | Comparlify",
    metaDescription: "Generate clean, SEO-friendly URL slugs from blog titles or headings. Strip stop-words, convert unicode characters, and format custom separators.",
    whatIsIt: "An SEO utility converting headlines, titles, or strings into URL-safe slug expressions.",
    howToUse: "Type a title or string, configure options (remove stop-words like 'and', 'the', max length), and copy the generated slug.",
    faqs: [
      { question: "What is a URL slug?", answer: "A slug is the human-readable, hyphenated part of a URL that identifies a specific page (e.g. `/blog/how-to-compress-images`)." }
    ],
    relatedTools: ["case-converter", "word-counter"]
  }
];

export function getToolBySlug(slugPath: string[]): ToolDefinition | undefined {
  if (slugPath.length === 1) {
    const [slug] = slugPath;
    return TOOLS.find(t => t.slug === slug && !t.subcategory);
  } else if (slugPath.length === 2) {
    const [categoryOrSub, slug] = slugPath;
    // Try category/tool
    let found = TOOLS.find(t => t.category === categoryOrSub && t.slug === slug && !t.subcategory);
    if (found) return found;
    // Try subcategory/tool
    found = TOOLS.find(t => t.subcategory === categoryOrSub && t.slug === slug);
    return found;
  } else if (slugPath.length === 3) {
    const [category, subcategory, slug] = slugPath;
    return TOOLS.find(t => t.category === category && t.subcategory === subcategory && t.slug === slug);
  }
  return undefined;
}
