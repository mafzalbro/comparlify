import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Function under test for regex processing (extracted from scripts/prisma-switch.js)
function processSchemaContent(content: string, provider: "mysql" | "mongodb"): string {
  let combinedContent = content;
  if (provider === "mongodb") {
    // 1. Update the datasource block to use MongoDB and remove SQL relationMode
    combinedContent = combinedContent.replace(
      /datasource\s+db\s*\{[\s\S]*?provider\s*=\s*"mysql"[\s\S]*?\}/g,
      `datasource db {\n  provider     = "mongodb"\n  url          = env("DATABASE_URL")\n}`
    );

    // 2. Map all ID fields to _id
    combinedContent = combinedContent.replace(
      /\bid\s+String\s+@id(\s+@default\(cuid\(\)\))?/g,
      `id String @id$1 @map("_id")`
    );

    // 3. Remove all SQL-specific @db.* annotations
    combinedContent = combinedContent.replace(/@db\.[a-zA-Z0-9_]+(\([^)]*\))?/g, "");

    // 4. Convert implicit many-to-many relationships to MongoDB-compatible relation syntax
    combinedContent = combinedContent.replace(
      /model\s+ForumTopic\s*\{([\s\S]*?)\bplatforms\s+Platform\[\]([\s\S]*?)\}/g,
      "model ForumTopic {\n$1platformIds String[]\n  platforms  Platform[] @relation(fields: [platformIds], references: [id])$2}"
    );

    combinedContent = combinedContent.replace(
      /model\s+NewsArticle\s*\{([\s\S]*?)\bplatforms\s+Platform\[\]([\s\S]*?)\}/g,
      "model NewsArticle {\n$1platformIds String[]\n  platforms  Platform[] @relation(fields: [platformIds], references: [id])$2}"
    );

    combinedContent = combinedContent.replace(
      /model\s+Post\s*\{([\s\S]*?)\bplatforms\s+Platform\[\]([\s\S]*?)\}/g,
      "model Post {\n$1platformIds String[]\n  platforms  Platform[] @relation(fields: [platformIds], references: [id])$2}"
    );

    combinedContent = combinedContent.replace(
      /model\s+Platform\s*\{([\s\S]*?)\bposts\s+Post\[\]([\s\S]*?)\}/g,
      "model Platform {\n$1postIds String[]\n  posts  Post[] @relation(fields: [postIds], references: [id])$2}"
    );

    combinedContent = combinedContent.replace(
      /model\s+Platform\s*\{([\s\S]*?)\bnewsArticles\s+NewsArticle\[\]([\s\S]*?)\}/g,
      "model Platform {\n$1newsArticleIds String[]\n  newsArticles  NewsArticle[] @relation(fields: [newsArticleIds], references: [id])$2}"
    );

    combinedContent = combinedContent.replace(
      /model\s+Platform\s*\{([\s\S]*?)\bforumTopics\s+ForumTopic\[\]([\s\S]*?)\}/g,
      "model Platform {\n$1forumTopicIds String[]\n  forumTopics  ForumTopic[] @relation(fields: [forumTopicIds], references: [id])$2}"
    );
  } else {
    // Under mysql, make sure the datasource is explicitly mysql with relationMode prisma
    combinedContent = combinedContent.replace(
      /datasource\s+db\s*\{[\s\S]*?provider\s*=\s*"(mysql|mongodb)"[\s\S]*?\}/g,
      `datasource db {\n  provider     = "mysql"\n  url          = env("DATABASE_URL")\n  relationMode = "prisma"\n}`
    );
  }
  return combinedContent;
}

// Function under test for parsing connection string (extracted from prismaClientSingleton in prisma.ts)
function isMongoConnectionString(connectionString: string): boolean {
  return connectionString.startsWith("mongodb://") || connectionString.startsWith("mongodb+srv://");
}

describe("Prisma Switch Database Support", () => {
  describe("Connection String Parser", () => {
    it("should return true for mongodb connection strings", () => {
      expect(isMongoConnectionString("mongodb://localhost:27017/db")).toBe(true);
      expect(isMongoConnectionString("mongodb+srv://user:pass@cluster.mongodb.net/db")).toBe(true);
    });

    it("should return false for mysql connection strings", () => {
      expect(isMongoConnectionString("mysql://user:pass@localhost:3306/db")).toBe(false);
      expect(isMongoConnectionString("postgresql://user:pass@localhost:5432/db")).toBe(false);
    });
  });

  describe("Schema Compiler/Translator Logic", () => {
    const sampleBaseSchema = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider     = "mysql"
  relationMode = "prisma"
}
`;

    const sampleModelSchema = `
model Advertisement {
    id           String            @id @default(cuid())
    type         AdvertisementType @default(IMAGE)
    content      String            @db.Text
    imageUrl     String?           @db.Text
    linkUrl      String?           @db.Text
    placement    AdPlacementType
    active       Boolean           @default(true)
    allowedPages String?           @db.Text
    createdAt    DateTime          @default(now())
    updatedAt    DateTime          @updatedAt

    @@index([placement])
}
`;

    const sampleUserSchema = `
model User {
  id              String          @id @default(cuid())
  name            String?
  email           String?         @unique
  role            Role            @default(USER)
}
`;

    it("should translate schema correctly to MongoDB format", () => {
      const fullSchema = sampleBaseSchema + "\n" + sampleModelSchema + "\n" + sampleUserSchema;
      const mongoSchema = processSchemaContent(fullSchema, "mongodb");

      // Verify provider updated and relationMode removed
      expect(mongoSchema).toContain('provider     = "mongodb"');
      expect(mongoSchema).toContain('url          = env("DATABASE_URL")');

      // Verify ID mapping to _id works with various spaces
      expect(mongoSchema).toContain('id String @id @default(cuid()) @map("_id")');
      expect(mongoSchema).not.toContain('id           String            @id @default(cuid())');

      // Verify SQL-specific @db annotations stripped
      expect(mongoSchema).toContain('content      String');
      expect(mongoSchema).not.toContain('@db.Text');
    });

    it("should generate schema correctly for MySQL format", () => {
      const fullSchema = sampleBaseSchema + "\n" + sampleModelSchema + "\n" + sampleUserSchema;
      const mysqlSchema = processSchemaContent(fullSchema, "mysql");

      // Verify provider and relationMode exist
      expect(mysqlSchema).toContain('provider     = "mysql"');
      expect(mysqlSchema).toContain('relationMode = "prisma"');

      // Verify IDs and @db annotations are preserved
      expect(mysqlSchema).toContain('id           String            @id @default(cuid())');
      expect(mysqlSchema).toContain('content      String            @db.Text');
    });
  });
});
