/**
 * Rewrite each program's `description` via Groq so it's distinct from the
 * imported open-affiliate copy. Results are cached in data/rewrites.json
 * so subsequent runs only call Groq for new programs.
 *
 *   GROQ_API_KEY=... npx tsx scripts/rewrite-descriptions.ts
 *
 * Pass `--force <slug>` (or `--all`) to bypass the cache for entries.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const PROGRAMS_PATH = resolve(process.cwd(), "src/data/programs.json");
const CACHE_PATH = resolve(process.cwd(), "data/rewrites.json");
const MODEL = "llama-3.1-8b-instant";
const CONCURRENCY = 8;

type Program = {
  slug: string;
  name: string;
  category: string;
  short_description: string;
  description: string;
};

type Cache = Record<string, { rewritten: string; sourceHash: string; at: string }>;

function hash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = ((h * 31 + input.charCodeAt(i)) | 0) >>> 0;
  return h.toString(36);
}

function loadCache(): Cache {
  if (!existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveCache(c: Cache): void {
  writeFileSync(CACHE_PATH, JSON.stringify(c, null, 0));
}

async function rewrite(p: Program): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const prompt = `Rewrite the following affiliate program description in 2 short paragraphs (60-110 words total). Preserve all factual claims about the product, audience, and use cases. Keep tone clear and professional, no marketing fluff, no emojis, no headings, no bullet points. Output only the rewritten description text.

Program: ${p.name}
Category: ${p.category}
Tagline: ${p.short_description}

Original:
${p.description}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 280,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  const out = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!out || out.length < 40) throw new Error(`empty/short response for ${p.slug}`);
  return out;
}

async function runPool<T>(items: T[], n: number, fn: (item: T) => Promise<void>): Promise<void> {
  let i = 0;
  const workers: Promise<void>[] = [];
  for (let w = 0; w < n; w++) {
    workers.push(
      (async () => {
        while (true) {
          const idx = i++;
          if (idx >= items.length) return;
          await fn(items[idx]);
        }
      })()
    );
  }
  await Promise.all(workers);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const force = args.has("--all");
  const programs: Program[] = JSON.parse(readFileSync(PROGRAMS_PATH, "utf8"));
  const cache = loadCache();

  const todo = programs.filter((p) => {
    const sourceHash = hash(p.description);
    const entry = cache[p.slug];
    if (force) return true;
    if (!entry) return true;
    if (entry.sourceHash !== sourceHash) return true;
    return false;
  });

  console.log(`[rewrite] ${todo.length} of ${programs.length} programs need rewriting`);
  if (todo.length === 0) return;

  let done = 0;
  let failed = 0;
  await runPool(todo, CONCURRENCY, async (p) => {
    try {
      const rewritten = await rewrite(p);
      cache[p.slug] = {
        rewritten,
        sourceHash: hash(p.description),
        at: new Date().toISOString(),
      };
      done++;
      if (done % 25 === 0) {
        saveCache(cache);
        console.log(`  …${done}/${todo.length}`);
      }
    } catch (err) {
      failed++;
      console.error(`  ✗ ${p.slug}: ${(err as Error).message}`);
    }
  });

  saveCache(cache);
  console.log(`[rewrite] done: ${done} written, ${failed} failed, cache=${Object.keys(cache).length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
