import { readFile, writeFile } from 'node:fs/promises';

const START_PREFIX = '<!-- fe-harness:start';
const END_PREFIX = '<!-- fe-harness:end';
const RULE_START_PREFIX = '<!-- fe-harness-rule:start';
const RULE_END_PREFIX = '<!-- fe-harness-rule:end';

export function parseManagedBlocks(content, prefix = START_PREFIX) {
  const blocks = [];
  const endPrefix = prefix === START_PREFIX ? END_PREFIX : RULE_END_PREFIX;
  const startRegex = new RegExp(
    `${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+id=([\\w-]+)\\s*-->`,
    'g',
  );
  let match;
  while ((match = startRegex.exec(content)) !== null) {
    const id = match[1];
    const startIndex = match.index;
    const startEnd = startIndex + match[0].length;
    const endRegex = new RegExp(
      `${endPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+id=${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*-->`,
    );
    const endMatch = endRegex.exec(content.slice(startEnd));
    if (endMatch) {
      const innerStart = startEnd;
      const innerEnd = startEnd + endMatch.index;
      const fullEnd = innerEnd + endMatch[0].length;
      blocks.push({
        id,
        start: startIndex,
        end: fullEnd,
        inner: content.slice(innerStart, innerEnd).trim(),
        full: content.slice(startIndex, fullEnd),
      });
    }
    startRegex.lastIndex = startIndex + match[0].length;
  }
  return blocks;
}

export function buildManagedBlock(id, content, isRule = false) {
  const start = isRule
    ? `${RULE_START_PREFIX} id=${id} -->`
    : `${START_PREFIX} id=${id} -->`;
  const end = isRule
    ? `${RULE_END_PREFIX} id=${id} -->`
    : `${END_PREFIX} id=${id} -->`;
  return `${start}\n${content}\n${end}`;
}

export async function upsertManagedBlock(filePath, id, content, isRule = false) {
  const source = await readFile(filePath, 'utf8').catch(() => '');
  const blocks = parseManagedBlocks(source, isRule ? RULE_START_PREFIX : START_PREFIX);
  const existing = blocks.find((b) => b.id === id);
  const block = buildManagedBlock(id, content, isRule);

  if (!existing) {
    const newContent = source ? `${source}\n\n${block}\n` : `${block}\n`;
    await writeFile(filePath, newContent, 'utf8');
    return { action: 'create', id, target: filePath };
  }

  if (existing.inner === content.trim()) {
    return { action: 'keep', id, target: filePath };
  }

  const newContent = source.slice(0, existing.start) + block + source.slice(existing.end);
  await writeFile(filePath, newContent, 'utf8');
  return { action: 'managed-update', id, target: filePath };
}

export function extractManagedBlockIds(content, isRule = false) {
  const prefix = isRule ? RULE_START_PREFIX : START_PREFIX;
  const blocks = parseManagedBlocks(content, prefix);
  return blocks.map((b) => b.id);
}

export function findDuplicateIds(content, isRule = false) {
  const prefix = isRule ? RULE_START_PREFIX : START_PREFIX;
  const blocks = parseManagedBlocks(content, prefix);
  const ids = blocks.map((b) => b.id);
  return ids.filter((id, index) => ids.indexOf(id) !== index);
}

export function findUnclosedBlocks(content, isRule = false) {
  const prefix = isRule ? RULE_START_PREFIX : START_PREFIX;
  const endPrefix = isRule ? RULE_END_PREFIX : END_PREFIX;
  const blocks = parseManagedBlocks(content, prefix);
  const startCount = (content.match(new RegExp(prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const endCount = (content.match(new RegExp(endPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  return startCount !== endCount || startCount !== blocks.length * 2
    ? startCount - blocks.length
    : 0;
}
