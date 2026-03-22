# WatchTogether — Setup Guide

## What's in this project

```
watchtogether/
├── server.js          ← The backend (syncs two viewers)
├── package.json       ← Project config
├── public/
│   └── index.html     ← The entire frontend (Apple-style UI)
└── data.json          ← Created automatically (stores watch history)
```

---

## Step 1: Install Node.js

1. Go to **https://nodejs.org**
2. Download the **LTS** version (big green button)
3. Install it (click Next through everything)
4. Verify — open Terminal (Mac) or Command Prompt (Windows):
   ```
   node --version
   ```
   You should see something like `v20.x.x`

---

## Step 2: Test locally on your computer

1. Download the `watchtogether` folder to your computer
2. Open Terminal / Command Prompt
3. Navigate to the folder:
   ```
   cd path/to/watchtogether
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Start the server:
   ```
   npm start
   ```
6. Open browser: **http://localhost:3000**
7. Enter your name and you're in!

Test with two people on the same WiFi:
- Find your local IP (Google "what is my local IP")
- Partner opens: `http://YOUR_IP:3000`

---

## Step 3: Put it online (use from anywhere)

### Option A: Render.com (Free, easiest)

1. Create account at **https://render.com**
2. Push code to GitHub:
   - Create account at **https://github.com** if needed
   - Create new repository called `watchtogether`
   - Upload all files keeping the folder structure
3. In Render: **New → Web Service**
4. Connect your GitHub repo
5. Settings:
   - **Name:** watchtogether
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
6. Click **Create Web Service**
7. Wait 2-3 min — you get a URL like `https://watchtogether-xxxx.onrender.com`
8. Share URL with your girlfriend — done!

> Free tier sleeps after 15 min idle. First load takes ~30s to wake.

### Option B: Railway.app

1. Go to **https://railway.app**, sign in with GitHub
2. **New Project → Deploy from GitHub repo**
3. Select watchtogether repo, click Deploy
4. **Settings → Networking → Generate Domain**
5. Get URL like `https://watchtogether.up.railway.app`

---

## How to use

1. Both open the same URL
2. Enter names (to identify who rated what)
3. One person pastes a video URL → clicks Watch Now
4. Other person's screen auto-switches to watch view
5. Chat, send emoji reactions, play/pause — all syncs
6. Click "Done" to rate (1-10), both ratings saved in History

### What URLs work?

- YouTube embeds: `https://www.youtube.com/embed/VIDEO_ID`
- Direct .mp4 video file URLs
- Jellyfin/Plex shared links
- Any site allowing iframe embedding

---

## Troubleshooting

**Can't connect** → Make sure server is running (`npm start`)

**Video won't play** → Site might block iframes. Try YouTube embed URLs.

**Partner can't join** → Use deployed URL, not localhost.
