# UniSync

**A unified campus life app for students — lost & found, live dining status, study groups, a focus studio, a social feed, and a marketplace, all in one glassmorphism-styled interface.**

UniSync replaces the clutter of traditional student portals with a single, cohesive app that connects everyday campus utilities in real time.

---

## ✨ Features

| Module | What it does |
|---|---|
| 🔍 **Lost & Found** | Report and recover lost items with category/status filters, reward badges, and one-click contact. Points are awarded automatically when a found item is reported or successfully claimed. |
| 🍽️ **Live Food Tracker** | Crowdsourced dining hall stock status — upvote/downvote to mark items in stock, running low, or sold out, filterable by venue and dietary needs. |
| 👥 **Study Groups** | Course-specific study room discovery with capacity limits, meeting-format filters (in-person/virtual/hybrid), and one-click join/leave. |
| 🧠 **BrainBrew (Focus Studio)** | Energy-adaptive Pomodoro timers (High / Balanced / Fatigued) with ambient soundscapes — or link your own Spotify playlist instead. |
| 📢 **Campus Feed** | A social stream for announcements, club events, hackathons, and study tips, with likes, comments, and sharing. |
| 🛒 **Marketplace** | Buy and sell items peer-to-peer with category/condition tags and status tracking (Available / Reserved / Sold). |
| 🏆 **Points System** | Earn points for reporting found items, getting items claimed, posting to the feed, and receiving likes — all awarded server-side, with a live points badge and history. |
| 🎧 **Spotify Linking** | Paste a public Spotify playlist/track/album link to embed it directly in your profile or focus sessions — no login or API keys required. |

---

## 🎨 Design Philosophy

UniSync is built around a **Glassmorphism** design system:

- **True frosted glass** — semi-transparent surfaces with high-saturation backdrop blur for depth without visual noise
- **Minimalist palette** — dark slate background (`#0f0f1a`) with a single accent color (Violet `#7c6ef0`)
- **Clean typography** — Inter font family, subtle 1px borders, no decorative clutter
- **Micro-interactions** — smooth touch feedback, confetti on task completion, floating toast notifications

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite
- **Backend:** Supabase (Postgres, Auth, Realtime, Storage)
- **Auth:** Google OAuth via Supabase, restricted to college email domain
- **Styling:** Vanilla CSS with custom design tokens — no CSS framework
- **Icons:** [lucide-react](https://lucide.dev/)
- **Animations:** [canvas-confetti](https://www.kirilv.com/canvas-confetti/)

---

## 🗂️ Project Structure

```text
unisync-app/
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx                  # Central state & tab router
    ├── index.css                # Glassmorphism design system
    ├── lib/
    │   └── supabaseClient.js
    ├── hooks/
    │   ├── useLostItems.js
    │   ├── useFoodItems.js
    │   ├── useStudyGroups.js
    │   ├── useCampusFeed.js
    │   ├── useMarketplace.js
    │   └── usePoints.js
    ├── utils/
    │   └── spotifyEmbed.js
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Sidebar.jsx
    │   ├── BottomNav.jsx
    │   ├── Modal.jsx
    │   ├── ImageUpload.jsx
    │   └── SpotifyEmbed.jsx
    └── pages/
        ├── Dashboard.jsx
        ├── LostAndFound.jsx
        ├── FoodTracker.jsx
        ├── StudyGroups.jsx
        ├── BrainBrew.jsx
        ├── CampusFeed.jsx
        └── Marketplace.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project (free tier)
- A Google Cloud OAuth client (free)

### Setup

```bash
# Clone the repo
git clone https://github.com/<your-username>/unisync.git
cd unisync/unisync-app

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Run database migrations
# (Apply the SQL scripts in /supabase/migrations via the Supabase SQL Editor)

# Start the development server
npm run dev
```

### Build for production

```bash
npm run build
```

---

## 🔐 Environment Variables

Create a `.env` file in `unisync-app/` with:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Never commit `.env` — it's already covered in `.gitignore`.

---

## 🗄️ Database Schema

UniSync uses Supabase Postgres with Row Level Security enabled on every table. Core tables:

- `profiles` — student identity, points, Spotify link
- `lost_items` — lost & found registry
- `food_items` — dining hall stock tracking
- `study_groups` / `study_group_members` — study room rosters
- `campus_feed` / `campus_feed_likes` — social stream
- `marketplace_items` — peer-to-peer listings
- `points_ledger` — auditable point-earning history

Full SQL migrations are in `/supabase/migrations`.



---

## 📄 License

MIT — free to use, modify, and build on.

---

## 🙏 Acknowledgments

Built for the VIT-AP student community, with a focus on zero-cost, portfolio-worthy engineering using free-tier tools throughout.
