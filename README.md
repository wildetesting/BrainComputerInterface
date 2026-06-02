# Local Movement Diary

Local Movement Diary is an Android-hosted local web dashboard for a private
8pm daily movement diary. The app keeps data on the phone, stores it in local
SQLite, and renders a bundled HTML/CSS/JavaScript dashboard in a WebView.

## What it tracks

- Steps from Health Connect.
- Sleep sessions from Health Connect.
- Rough activity timeline from Android Activity Recognition.
- Location points sampled locally for an abstract route trace.
- 30-day local history.
- A daily 8pm notification that opens the diary.

The Android manifest intentionally does **not** request internet access.

## Sleep data

Android phones can infer some rest patterns from signals like stillness, screen
state, charging, and time of day, but the phone alone is not reliably accurate
sleep hardware. For useful sleep data, use Health Connect with one of these
sources:

1. A wearable that writes sleep sessions to Health Connect.
2. A trusted local sleep tracking app that writes sleep sessions to Health
   Connect.
3. Manual sleep entries in a Health Connect-compatible app.

This app reads `SleepSessionRecord` from Health Connect. If no sleep source has
written data, the diary shows sleep as unavailable instead of guessing.

## Local-first design

```text
Health Connect steps/sleep ----\
Activity Recognition -----------> local SQLite -> WebView dashboard
Location sampling -------------/
```

No cloud backend is required. The dashboard uses a JavaScript bridge with only
two methods:

- `getDiaryJson()` returns local diary JSON from SQLite.
- `refreshFromPhone()` asks Android to sync today's local phone data.

## Android permissions

The app asks for:

- Activity recognition for rough movement labels.
- Coarse/fine location for the abstract trace.
- Notifications for the 8pm reminder.
- Health Connect read access for steps and sleep.

Location is drawn as an abstract route, not as a network map. No map tiles are
loaded.

## Building

Open the repository in Android Studio and run the `app` module on an Android
phone with Google Play services and Health Connect available.

This repository currently does not include a Gradle wrapper. If building from a
terminal, install Gradle 9.4.1+ and an Android SDK that supports compile SDK 36,
then run:

```bash
gradle :app:assembleDebug
```