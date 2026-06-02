package com.localmovementdiary

import android.app.Activity
import android.os.Bundle
import android.widget.TextView

class PermissionsRationaleActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val message = TextView(this).apply {
            text = """
                Local Movement Diary reads Health Connect steps and sleep sessions to draw your private 8pm diary.

                Data stays in this app's local SQLite database on your phone. The app does not request internet access and does not upload your movement, location, or sleep data.
            """.trimIndent()
            textSize = 18f
            setPadding(48, 48, 48, 48)
        }
        setContentView(message)
    }
}
