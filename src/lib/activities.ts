import { getDb, touchActivity } from "./db";
import type {
  Activity,
  ActivityArtifact,
  ActivityCategory,
  ActivityStatus,
  ActivityStep,
  ActivityWithDetails,
  StepStatus,
} from "./types";

function mapActivity(row: Activity): Activity {
  return row;
}

export function listActivities(): Activity[] {
  const rows = getDb()
    .prepare(`SELECT * FROM activities ORDER BY updated_at DESC, id DESC`)
    .all() as Activity[];
  return rows.map(mapActivity);
}

export function getActivityById(id: number): ActivityWithDetails | null {
  const activity = getDb()
    .prepare(`SELECT * FROM activities WHERE id = ?`)
    .get(id) as Activity | undefined;

  if (!activity) return null;

  const steps = getDb()
    .prepare(
      `SELECT * FROM activity_steps WHERE activity_id = ? ORDER BY position ASC, id ASC`,
    )
    .all(id) as ActivityStep[];

  const artifacts = getDb()
    .prepare(`SELECT * FROM activity_artifacts WHERE activity_id = ? ORDER BY id ASC`)
    .all(id) as ActivityArtifact[];

  return { ...mapActivity(activity), steps, artifacts };
}

export interface CreateActivityInput {
  title: string;
  category?: ActivityCategory;
  status?: ActivityStatus;
  summary?: string;
  target_brand?: string;
  target_model?: string;
  frequency?: string;
  protocol?: string;
  code_type?: string;
  flipper_protocol?: string;
  outcome_notes?: string;
  safety_notes?: string;
  steps?: Array<{ title: string; description?: string }>;
}

export function createActivity(input: CreateActivityInput): ActivityWithDetails {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO activities (
      title, category, status, summary, target_brand, target_model,
      frequency, protocol, code_type, flipper_protocol, outcome_notes, safety_notes
    ) VALUES (
      @title, @category, @status, @summary, @target_brand, @target_model,
      @frequency, @protocol, @code_type, @flipper_protocol, @outcome_notes, @safety_notes
    )
  `);

  const result = insert.run({
    title: input.title,
    category: input.category ?? "other",
    status: input.status ?? "planned",
    summary: input.summary ?? null,
    target_brand: input.target_brand ?? null,
    target_model: input.target_model ?? null,
    frequency: input.frequency ?? null,
    protocol: input.protocol ?? null,
    code_type: input.code_type ?? null,
    flipper_protocol: input.flipper_protocol ?? null,
    outcome_notes: input.outcome_notes ?? null,
    safety_notes: input.safety_notes ?? null,
  });

  const activityId = Number(result.lastInsertRowid);
  const insertStep = db.prepare(`
    INSERT INTO activity_steps (activity_id, position, title, description)
    VALUES (?, ?, ?, ?)
  `);

  (input.steps ?? []).forEach((step, index) => {
    insertStep.run(activityId, index + 1, step.title, step.description ?? null);
  });

  return getActivityById(activityId)!;
}

export function updateActivityStatus(id: number, status: ActivityStatus) {
  getDb()
    .prepare(`UPDATE activities SET status = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(status, id);
}

export function updateStepStatus(stepId: number, status: StepStatus) {
  const step = getDb()
    .prepare(`SELECT activity_id FROM activity_steps WHERE id = ?`)
    .get(stepId) as { activity_id: number } | undefined;

  if (!step) return null;

  getDb().prepare(`UPDATE activity_steps SET status = ? WHERE id = ?`).run(status, stepId);
  touchActivity(step.activity_id);
  return getActivityById(step.activity_id);
}

export function countActivities(): number {
  const row = getDb().prepare(`SELECT COUNT(*) as count FROM activities`).get() as {
    count: number;
  };
  return row.count;
}

export function seedIfEmpty() {
  if (countActivities() > 0) return false;
  seedDominatorActivity();
  return true;
}

export function seedDominatorActivity() {
  createActivity({
    title: "Dominator garage door — Flipper as backup remote",
    category: "sub-ghz",
    status: "in_progress",
    summary:
      "Pair the Flipper Zero as a new ATA PTX4 virtual remote for a Dominator garage door. Rolling-code systems cannot be cloned via Read/Replay — Add Manually + motor learn mode is required.",
    target_brand: "Dominator",
    target_model: "PTX4 / DOM502 / DOM505 (confirm on your remote)",
    frequency: "433.92 MHz",
    protocol: "SecuraCode (rolling)",
    code_type: "Rolling code",
    flipper_protocol: "ATA PTX4 (Add Manually)",
    safety_notes:
      "Only use on property you own or have explicit permission to access. Pairing adds a new authorized remote slot — treat the Flipper like a spare key.",
    steps: [
      {
        title: "Update Flipper firmware",
        description: "Connect via qFlipper and install the latest official firmware.",
      },
      {
        title: "Back up existing Sub-GHz files",
        description: "qFlipper → File Manager → subghz/ — copy to your backup folder.",
      },
      {
        title: "Identify remote and motor model",
        description:
          "Check remote label (PTX4, DOM502, DOM505) and motor label. TrioCode128 (grey v2 remotes) is not supported on stock firmware.",
      },
      {
        title: "Confirm frequency with Frequency Analyzer",
        description:
          "Sub-GHz → Frequency Analyzer. Press remote button ~30 cm away. Expect peak near 433.92 MHz.",
      },
      {
        title: "Create virtual remote (Add Manually)",
        description:
          "Sub-GHz → Add Manually → ATA PTX4. Name it e.g. Dominator_Garage_1 and save.",
      },
      {
        title: "Put motor into learn mode",
        description:
          "Press and hold the blue Door Code button on the motor (or SW1/SW2 on receiver board) until LED indicates learn mode.",
      },
      {
        title: "Pair Flipper (double-press handshake)",
        description:
          "Saved → your file → Emulate. Press OK ~2 seconds, wait 1–2 s, press OK again ~2 seconds. Release Door Code button.",
      },
      {
        title: "Test operation",
        description: "Emulate again — door should open/close. Verify original remote still works.",
      },
      {
        title: "Back up .sub file and log outcome",
        description:
          "Copy dominator_garage_1.sub to dashboard artifacts. Mark activity success or note failures.",
      },
    ],
  });
}
