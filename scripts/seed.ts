import { loadEnvConfig } from "@next/env";
import { seedDataset } from "../src/server/sanity";
loadEnvConfig(process.cwd());
if (!process.argv.includes("--confirm-public-fixtures"))
  throw new Error(
    "Seed only the dedicated dataset: npm run seed -- --confirm-public-fixtures",
  );
try {
  const result = await seedDataset();
  console.log(
    JSON.stringify(
      {
        verified: true,
        entries: result.workspace.workflows.length,
        sources: result.workspace.sources.length,
        publicationCount: result.workspace.publications.length,
        scope: "Synthetic content; draft documents, no visitor publication",
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : "Seed failed");
  process.exitCode = 1;
}
