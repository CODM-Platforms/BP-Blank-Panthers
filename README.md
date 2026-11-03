# BP Black Panthers (`ẞP.ঐ`) — CODM Clan Platform

Official web platform and clan management system for **BP Black Panthers**, a Call of Duty: Mobile (CODM) clan founded in Tanzania and led by **GUITZY**, **CRADY**, **LENXON**, and **404**.

---

## Features

### Public Pages
- **Home (`/`)** — Clan hero, live database stats (Active Members, Upcoming Tournaments, Completed Tournaments), Recent Victory spotlight, and upcoming tournament/news cards.
- **About (`/about`)** — Clan origins, core values (Discipline, Brotherhood, Dominance), and the Command Roster (Clan Leaders).
- **Rules (`/rules`)** — Official BP Black Panthers CODM clan rules and `ẞP.ঐ` tag requirements.
- **Roster (`/roster` & `/player/[codmUsername]`)** — Active approved clan members, preferred mode (`BR` / `MP` / `Both`), main CODM class/role, region, and tournament attendance history.
- **Tournaments (`/tournaments`, `/tournaments/[id]`, `/tournaments/[id]/results`)** — Upcoming clan tournaments, confirmed players, generated teams, final standings, and scoreboard screenshots.
- **News (`/news` & `/news/[id]`)** — Clan announcements, tournament recaps, and achievements.
- **Join Clan (`/join`)** — Player application form with automatic `ẞP.ঐ` tag prefixing, CODM UID, WhatsApp number, preferred mode, CODM BR Class / MP Role (with custom option), device info, and location.
- **Attendance Confirmation (`/confirm/[token]`)** — Passwordless link for invited clan members to confirm or decline tournament attendance.

### Admin Dashboard (`/admin`)
- **Overview (`/admin`)** — Live member counts, pending applications, and upcoming tournament management.
- **Members (`/admin/members` & `/admin/members/[id]`)** — Approve, warn, suspend, or edit member profiles, and send WhatsApp group invites.
- **Tournaments (`/admin/tournaments`)** — Create/edit tournaments, invite members, auto-generate balanced teams, record placements/points, upload result photos, and export printable HTML rosters.
- **News / Content (`/admin/content`)** — Publish news, announcements, and achievement posts.
- **Settings (`/admin/settings`)** — Configure clan details and WhatsApp group link.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Database & ORM:** PostgreSQL + Prisma 8 (`@prisma/orm-postgres`)
- **Styling:** Tailwind CSS

---

## Development

```bash
# Install dependencies
npm install

# Emit Prisma 8 contract types after editing prisma/schema.prisma
npm run contract:emit

# Seed initial clan & admin accounts
npm run db:seed

# Start local dev server
npm run dev
```
