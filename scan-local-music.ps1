import fs from 'node:fs/promises';
import path from 'node:path';
import { ensureDirs, ROOT, RESEARCH_DIR, CACHE_DIR, readJson, writeJson, dedupe } from './lib/utils.mjs';
import { readAppleRss } from './sources/apple-rss.mjs';
import { readHtmlChart } from './sources/html-chart.mjs';

await ensureDirs();
const registry = await readJson(path.join(ROOT, 'data', 'source-registry.json'), { sources: [] });
const force = String(process.env.FORCE_REFRESH || '').toLowerCase() === 'true';
const adapters = { 'apple-rss': readAppleRss, 'html-chart': readHtmlChart };
const statuses = [];
const allItems = [];

for (const source of registry.sources.filter(item => item.enabled !== false)) {
  const cacheFile = path.join(CACHE_DIR, `${source.id}.json`);
  const outputFile = path.join(RESEARCH_DIR, `${source.id}.json`);
  try {
    const adapter = adapters[source.type];
    if (!adapter) throw new Error(`Ukendt adapter: ${source.type}`);
    const items = await adapter(source);
    if (!items.length) throw new Error('Kilden returnerede ingen gyldige sange');
    const payload = { id: source.id, name: source.name, updatedAt: new Date().toISOString(), status: 'ok', count: items.length, items };
    await writeJson(cacheFile, payload);
    await writeJson(outputFile, payload);
    statuses.push({ id: source.id, name: source.name, status: 'ok', count: items.length });
    allItems.push(...items);
    console.log(`${source.name}: ${items.length}`);
  } catch (error) {
    const cached = await readJson(cacheFile, null);
    const items = cached?.items || [];
    const payload = {
      id: source.id,
      name: source.name,
      updatedAt: cached?.updatedAt || null,
      checkedAt: new Date().toISOString(),
      status: items.length ? 'stale' : 'failed',
      error: error.message,
      count: items.length,
      items
    };
    await writeJson(outputFile, payload);
    statuses.push({ id: source.id, name: source.name, status: payload.status, count: items.length, error: error.message });
    allItems.push(...items);
    console.warn(`${source.name}: ${payload.status} — ${error.message}`);
  }
}

const combined = dedupe(allItems).sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
await writeJson(path.join(RESEARCH_DIR, 'current-all.json'), {
  updatedAt: new Date().toISOString(),
  count: combined.length,
  items: combined
});
await writeJson(path.join(RESEARCH_DIR, 'manifest.json'), {
  version: '2.0',
  updatedAt: new Date().toISOString(),
  forceRefresh: force,
  sources: statuses.length,
  successfulSources: statuses.filter(item => item.status === 'ok').length,
  staleSources: statuses.filter(item => item.status === 'stale').length,
  failedSources: statuses.filter(item => item.status === 'failed').length,
  totalItems: combined.length,
  statuses
});
