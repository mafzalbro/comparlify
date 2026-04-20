## 2025-05-14 - [File Upload Extension Validation]
**Vulnerability:** Arbitrary file upload in `src/app/api/upload/route.ts`.
**Learning:** The application allowed admins to upload any file type (e.g., `.php`, `.sh`, `.env`) as long as it was under 5MB. While the filename was regenerated to prevent path traversal, the extension was trusted from user input.
**Prevention:** Implement a strict whitelist of allowed extensions (e.g., `jpg`, `jpeg`, `png`, `webp`, `gif`, `svg`) and normalize the extension to lowercase before validation.
