import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/db/rls.ts",
        "src/db/seed.ts",
        "src/db/types.ts",
        "src/db/schema/enums.ts",
        "src/db/schema/validations.ts",
        "src/lib/api/**",
        "src/lib/auth/**",
        "src/lib/repositories/**",
      ],
      exclude: [
        "src/db/schema/!(enums|validations).ts",
        "src/db/client.ts",
        "src/app/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
