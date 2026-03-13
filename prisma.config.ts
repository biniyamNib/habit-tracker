// prisma.config.ts  (at project root)
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),  // ← change to DIRECT_URL
  },
});