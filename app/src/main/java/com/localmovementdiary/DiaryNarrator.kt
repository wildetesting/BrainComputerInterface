package com.localmovementdiary

object DiaryNarrator {
    fun describe(steps: Long, sleepMinutes: Long, sleepConfidence: String): String {
        val movementTone = when {
            steps >= 12_000 -> "a roaming day with long trails"
            steps >= 7_000 -> "a steady day with clear movement"
            steps >= 3_000 -> "a light-moving day"
            steps > 0 -> "a mostly quiet day with a few steps"
            else -> "a quiet day with no recorded steps yet"
        }

        val sleepTone = when {
            sleepConfidence == "none" -> "Sleep was not recorded locally."
            sleepMinutes >= 8 * 60 -> "Sleep looked long and settled."
            sleepMinutes >= 6 * 60 -> "Sleep looked moderate."
            sleepMinutes > 0 -> "Sleep looked short or interrupted."
            else -> "Sleep data is waiting for Health Connect."
        }

        return "${movementTone.replaceFirstChar { it.uppercase() }}. $sleepTone"
    }
}
