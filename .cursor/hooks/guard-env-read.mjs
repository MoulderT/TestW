#!/usr/bin/env node
/**
 * beforeReadFile: не отдаёт в модель содержимое секретных .env (кроме примеров).
 */
import { basename } from "node:path";

const chunks = [];
for await (const c of process.stdin) chunks.push(c);
const raw = Buffer.concat(chunks).toString("utf8").trim();

let payload = {};
try {
  payload = raw ? JSON.parse(raw) : {};
} catch {
  console.log(JSON.stringify({ permission: "allow" }));
  process.exit(0);
}

const filePath = String(payload.file_path ?? "");
const base = basename(filePath).toLowerCase();

const allowed = [".env.example", ".env.sample", ".env.template", ".env.local.example"];
const isDotEnv =
  base === ".env" ||
  (base.startsWith(".env.") && !allowed.includes(base));

if (isDotEnv) {
  console.log(
    JSON.stringify({
      permission: "deny",
      user_message:
        "Reading secret env files is blocked by project hook. Use .env.example and document variables in README.",
    })
  );
  process.exit(0);
}

console.log(JSON.stringify({ permission: "allow" }));
process.exit(0);
