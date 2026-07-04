import Link from "next/link";

interface GuideSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

function GuideSection({ id, title, children }: GuideSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function SpecTable({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-card-border">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-card-border last:border-0">
              <th className="w-1/3 bg-background px-4 py-3 text-left font-medium text-muted">
                {row.label}
              </th>
              <td className="px-4 py-3">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StepList({ steps }: { steps: Array<{ title: string; detail: string }> }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex gap-4 rounded-xl border border-card-border bg-card p-4"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-sm font-bold text-black">
            {index + 1}
          </span>
          <div>
            <p className="font-medium">{step.title}</p>
            <p className="mt-1 text-sm text-muted">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

const TOC = [
  { id: "why", label: "Why you need it" },
  { id: "choose", label: "Choose a card" },
  { id: "install", label: "Physical install" },
  { id: "format", label: "Format & setup" },
  { id: "verify", label: "Verify it works" },
  { id: "troubleshoot", label: "Troubleshooting" },
];

export default function SdCardGuidePage() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <Link href="/" className="text-sm text-muted transition hover:text-foreground">
          ← Back to dashboard
        </Link>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Setup guide</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Install the microSD card</h1>
        <p className="max-w-3xl text-muted">
          Flipper Zero does not ship with a microSD card. You need one installed before
          updating firmware or saving keys, signals, BadUSB scripts, and Sub-GHz captures.
        </p>
      </div>

      <nav className="rounded-2xl border border-card-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-muted">On this page</p>
        <ul className="flex flex-wrap gap-2">
          {TOC.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="rounded-lg border border-card-border px-3 py-1.5 text-sm transition hover:border-accent/40 hover:text-accent"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
        <div className="space-y-10">
          <GuideSection id="why" title="Why you need a microSD card">
            <p className="text-muted">
              The internal flash on Flipper Zero is reserved for firmware. Almost everything
              you collect or create lives on the SD card:
            </p>
            <ul className="list-inside list-disc space-y-2 text-sm text-muted">
              <li>Sub-GHz captures, NFC/RFID keys, and infrared remotes</li>
              <li>BadUSB scripts (e.g. Rubber Ducky payloads)</li>
              <li>Signal databases copied during firmware updates</li>
              <li>User files accessible via qFlipper and mobile apps</li>
            </ul>
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
              <p className="font-semibold text-warning">Install before updating firmware</p>
              <p className="mt-1 text-muted">
                Databases are copied to the SD card during the last stage of a firmware update.
                Insert and format the card before your first update.
              </p>
            </div>
          </GuideSection>

          <GuideSection id="choose" title="Choose the right card">
            <SpecTable
              rows={[
                { label: "Type", value: "microSD (not SD, not miniSD)" },
                { label: "Max capacity", value: "Up to 256 GB (official spec)" },
                { label: "Recommended", value: "16 GB or 32 GB — plenty for Flipper files" },
                { label: "Interface", value: "Must support SPI mode (all quality branded cards do)" },
                { label: "Filesystem", value: "FAT32 or exFAT" },
                { label: "Brands", value: "SanDisk, Samsung, Kingston (avoid no-name cards)" },
              ]}
            />
            <p className="text-sm text-muted">
              Flipper reads/writes small files over SPI at modest speed — a 128 GB card works
              but offers no practical benefit. A 16–32 GB card from a trusted brand is the sweet
              spot.
            </p>
            <p className="text-sm">
              Official recommended cards:{" "}
              <a
                href="https://flipp.dev/sd-card"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                flipp.dev/sd-card
              </a>
            </p>
          </GuideSection>

          <GuideSection id="install" title="Physical installation">
            <div className="rounded-xl border border-card-border bg-card p-5 font-mono text-xs leading-relaxed text-muted">
              <pre>{`Flipper Zero (back view, SD slot on left side)

    ┌─────────────────────┐
    │  [screen]           │
    │                     │
    │  ○ SD slot          │  ← slot is on the left edge
    │    ▓▓▓▓▓▓▓▓         │     contacts face DOWN (toward PCB)
    │    ▓▓▓▓▓▓▓▓         │
    └─────────────────────┘

    Push IN until you feel/hear a CLICK (spring lock)
    To remove: push again — card pops out slightly, then pull`}</pre>
            </div>

            <StepList
              steps={[
                {
                  title: "Power off or lock the Flipper (optional but safer)",
                  detail:
                    "You can insert a card while the device is on, but powering off avoids accidental input during handling.",
                },
                {
                  title: "Orient the card — contacts facing down",
                  detail:
                    "Hold the microSD card so the gold contacts face the bottom of the Flipper (toward the circuit board). The label usually faces up.",
                },
                {
                  title: "Insert into the left-side slot",
                  detail:
                    "Align the card with the slot on the left edge of the Flipper. Slide it in straight — do not force at an angle.",
                },
                {
                  title: "Push until it clicks",
                  detail:
                    "The slot uses a push-to-lock spring mechanism. Push firmly with a fingernail or thin plastic tool until the card clicks flush inside the case. Short nails? Use the edge of a guitar pick or SIM tool — not metal that scratches contacts.",
                },
                {
                  title: "Confirm the card is seated",
                  detail:
                    "The card should sit nearly flush with the case edge. If it sticks out or wobbles, it is not locked — push again gently.",
                },
              ]}
            />

            <div className="rounded-xl border border-card-border bg-card p-4 text-sm">
              <p className="font-semibold">To remove the card</p>
              <p className="mt-1 text-muted">
                Push the card inward once more — the spring releases it and the card pops out
                slightly. Pinch and pull it out. Never yank a card that has not been unlocked
                by the spring.
              </p>
            </div>
          </GuideSection>

          <GuideSection id="format" title="Format and first-time setup">
            <StepList
              steps={[
                {
                  title: "Turn on the Flipper with the card inserted",
                  detail: "Wait a few seconds for the device to detect the card.",
                },
                {
                  title: "Format from the Flipper menu (recommended)",
                  detail:
                    "Main Menu → Settings → Storage → Format SD card. This creates the correct FAT32/exFAT layout and folder structure.",
                },
                {
                  title: "Or format on a computer first",
                  detail:
                    "If the card was used elsewhere, format to FAT32 (cards ≤32 GB) or exFAT (larger cards) before inserting. Then still run Format SD card on the Flipper once.",
                },
                {
                  title: "Update firmware with the card in place",
                  detail:
                    "Connect qFlipper and install the latest firmware. Database files copy to the SD card during the update — keep the card inserted throughout.",
                },
              ]}
            />
          </GuideSection>

          <GuideSection id="verify" title="Verify it works">
            <StepList
              steps={[
                {
                  title: "Check Storage settings",
                  detail:
                    "Settings → Storage — you should see free space (e.g. ~14 GB free on a 16 GB card). No “SD card not found” error.",
                },
                {
                  title: "Save a test file",
                  detail:
                    "Capture any Sub-GHz signal or create a BadUSB file. If it saves without error, the card is mounted correctly.",
                },
                {
                  title: "Browse via qFlipper",
                  detail:
                    "Connect USB → qFlipper → File Manager. You should see folders like subghz/, nfc/, rfid/, badusb/, infrared/.",
                },
              ]}
            />
          </GuideSection>

          <GuideSection id="troubleshoot" title="Troubleshooting">
            <div className="space-y-3">
              {[
                {
                  problem: "SD card not detected",
                  fix: "Reseat the card (push until click). Try a different branded card. Clean the slot with compressed air.",
                },
                {
                  problem: "Mounting SD card failed",
                  fix: "Format via Settings → Storage → Format SD card. Card may be NTFS or ext4 from another device — reformat to FAT32/exFAT.",
                },
                {
                  problem: "Card worked before, now fails",
                  fix: "Remove card, blow out dust from slot, reinsert. Cards can corrupt — back up via qFlipper and reformat.",
                },
                {
                  problem: "Cheap/no-name card unreliable",
                  fix: "Low-quality cards often have broken SPI support. Switch to SanDisk, Samsung, or Kingston.",
                },
                {
                  problem: "Features missing after firmware update",
                  fix: "Databases copy during update — re-run firmware update with a formatted card inserted, or restore from qFlipper.",
                },
              ].map((item) => (
                <div
                  key={item.problem}
                  className="rounded-xl border border-card-border bg-card p-4"
                >
                  <p className="font-medium">{item.problem}</p>
                  <p className="mt-1 text-sm text-muted">{item.fix}</p>
                </div>
              ))}
            </div>
            <p className="text-sm">
              Official support article:{" "}
              <a
                href="https://support.flipper.net/hc/en-us/articles/17915056214557-The-microSD-card-isn-t-detected-or-unable-to-mount"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                SD card not detected or unable to mount
              </a>
            </p>
          </GuideSection>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-accent/30 bg-accent-muted/20 p-5">
            <h3 className="text-sm font-semibold">Quick checklist</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>☐ 16–32 GB microSD (branded)</li>
              <li>☐ Contacts facing down</li>
              <li>☐ Push until click</li>
              <li>☐ Format on Flipper</li>
              <li>☐ Update firmware</li>
              <li>☐ Confirm in qFlipper</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-card-border bg-card p-5 text-sm">
            <h3 className="font-semibold">Folder layout (after format)</h3>
            <pre className="mt-3 overflow-x-auto font-mono text-xs text-muted">{`subghz/
nfc/
rfid/
badusb/
infrared/
lfrfid/
ibutton/
apps/
...`}</pre>
          </div>
        </aside>
      </div>
    </div>
  );
}
