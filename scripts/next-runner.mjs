import { rmSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const mode = process.argv[2];
const args = process.argv.slice(3).filter((arg) => arg !== "--");

if (!["dev", "build"].includes(mode)) {
  console.error("Usage: node scripts/next-runner.mjs <dev|build> [...next args]");
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = mode === "dev" ? ".next-dev" : ".next";
const distPath = path.join(root, distDir);

rmSync(distPath, { recursive: true, force: true });

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, mode, ...args], {
  cwd: root,
  env: {
    ...process.env,
    NEXT_DIST_DIR: distDir,
  },
  stdio: "inherit",
  windowsHide: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
