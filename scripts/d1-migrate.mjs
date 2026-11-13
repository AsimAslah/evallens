import { spawnSync } from "node:child_process";

const mode = process.argv[2];
const localId = "11111111-1111-4111-8111-111111111111";
const databaseId = mode === "local" ? localId : process.env.CLOUDFLARE_D1_ID;

if (!databaseId) {
  console.error("Set CLOUDFLARE_D1_ID to the production D1 database UUID.");
  process.exit(1);
}

const executable = process.platform === "win32" ? "cf.cmd" : "cf";
const args = ["d1", "migrations", "apply", databaseId, "--dir", "migrations"];
if (mode === "local") args.push("--local");

const result = spawnSync(executable, args, { stdio: "inherit", shell: process.platform === "win32" });
process.exit(result.status ?? 1);
