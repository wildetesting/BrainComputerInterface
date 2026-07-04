export type ActivityStatus = "planned" | "in_progress" | "success" | "failed" | "skipped";
export type ActivityCategory = "sub-ghz" | "nfc" | "rfid" | "ir" | "gpio" | "badusb" | "other";
export type StepStatus = "pending" | "done" | "failed" | "skipped";

export interface Activity {
  id: number;
  title: string;
  category: ActivityCategory;
  status: ActivityStatus;
  summary: string | null;
  target_brand: string | null;
  target_model: string | null;
  frequency: string | null;
  protocol: string | null;
  code_type: string | null;
  flipper_protocol: string | null;
  outcome_notes: string | null;
  safety_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityStep {
  id: number;
  activity_id: number;
  position: number;
  title: string;
  description: string | null;
  status: StepStatus;
}

export interface ActivityArtifact {
  id: number;
  activity_id: number;
  name: string;
  kind: string;
  path_or_url: string | null;
  notes: string | null;
}

export interface ActivityWithDetails extends Activity {
  steps: ActivityStep[];
  artifacts: ActivityArtifact[];
}

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  "sub-ghz": "Sub-GHz",
  nfc: "NFC",
  rfid: "RFID",
  ir: "Infrared",
  gpio: "GPIO",
  badusb: "BadUSB",
  other: "Other",
};

export const STATUS_LABELS: Record<ActivityStatus, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  success: "Success",
  failed: "Failed",
  skipped: "Skipped",
};

export const STEP_STATUS_LABELS: Record<StepStatus, string> = {
  pending: "Pending",
  done: "Done",
  failed: "Failed",
  skipped: "Skipped",
};
