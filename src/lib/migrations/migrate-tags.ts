import type { D1Database } from '@cloudflare/workers-types';

interface LeaderRow {
  id: number;
  tags: string | null;
}

interface TagRow {
  id: string;
}

/**
 * Migrates leader tags from the JSON column (leaders.tags) into the
 * normalized leader_tag_assignments junction table.
 *
 * This is idempotent -- it uses INSERT OR IGNORE so it can be run
 * multiple times safely.
 *
 * Prerequisites:
 *   - The leader_tag_assignments table must already exist
 *     (run migrations/001_normalize_tags.sql first)
 *   - The leader_tags reference table must be seeded
 */
export async function migrateTagsToJunctionTable(db: D1Database): Promise<{
  leadersProcessed: number;
  assignmentsCreated: number;
  skippedTags: string[];
}> {
  // Read all leaders that have tags
  const leaders = await db
    .prepare('SELECT id, tags FROM leaders WHERE tags IS NOT NULL')
    .all<LeaderRow>();

  // Get the valid tag IDs from the reference table
  const tags = await db.prepare('SELECT id FROM leader_tags').all<TagRow>();
  const validTagIds = new Set(tags.results?.map((t) => t.id) || []);

  const statements: D1PreparedStatement[] = [];
  const skippedTags: string[] = [];
  let leadersProcessed = 0;

  for (const leader of leaders.results || []) {
    if (!leader.tags) continue;

    let leaderTags: string[];
    try {
      leaderTags = JSON.parse(leader.tags);
      if (!Array.isArray(leaderTags)) continue;
    } catch {
      continue;
    }

    leadersProcessed++;

    for (const tagSlug of leaderTags) {
      if (validTagIds.has(tagSlug)) {
        statements.push(
          db
            .prepare(
              'INSERT OR IGNORE INTO leader_tag_assignments (leader_id, tag_id) VALUES (?, ?)',
            )
            .bind(leader.id, tagSlug),
        );
      } else {
        skippedTags.push(`${tagSlug} (leader ${leader.id})`);
      }
    }
  }

  let assignmentsCreated = 0;
  if (statements.length > 0) {
    // D1 batch is limited to 100 statements per call
    const BATCH_SIZE = 100;
    for (let i = 0; i < statements.length; i += BATCH_SIZE) {
      const batch = statements.slice(i, i + BATCH_SIZE);
      const results = await db.batch(batch);
      assignmentsCreated += results.reduce((sum, r) => sum + (r.meta?.changes || 0), 0);
    }
  }

  return { leadersProcessed, assignmentsCreated, skippedTags };
}
