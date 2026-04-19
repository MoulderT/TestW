#!/usr/bin/env node
/**
 * beforeShellExecution: блокирует разрушительные команды (сегменты shell, не весь текст echo/json).
 */
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

const full = String(payload.command ?? "");
/** Разбиение по && || ; | для проверки реальных подкоманд */
const segments = full.split(/(?:&&|\|\||;|\|)\s*/).map((s) => s.trim()).filter(Boolean);

const denyPatterns = [
  {
    re: /^docker\s+compose\s+down\b[\s\S]*(?:--volumes|\s-v(?:\s|$))/,
    why: "docker compose down with volume removal (-v/--volumes)",
  },
  { re: /^docker\s+system\s+prune\b/, why: "docker system prune" },
  { re: /^docker\s+volume\s+prune\b/, why: "docker volume prune" },
  { re: /^rm\s+[\s\S]*\s\/\s*$/, why: "rm targeting root /" },
  { re: /^format\s+[a-z]:\s*$/i, why: "disk format" },
];

for (const seg of segments) {
  for (const { re, why } of denyPatterns) {
    if (re.test(seg)) {
      console.log(
        JSON.stringify({
          permission: "deny",
          user_message: `Blocked potentially destructive command (${why}). Run manually if you really intend this.`,
          agent_message: `Command segment blocked by project hook: ${why}.`,
        })
      );
      process.exit(0);
    }
  }
}

console.log(JSON.stringify({ permission: "allow" }));
process.exit(0);
