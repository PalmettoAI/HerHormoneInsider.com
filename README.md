# Her Hormone Insider

Static letter blog at [herhormoneinsider.com](https://herhormoneinsider.com). Author: Marlowe Bennett. Built and maintained by [PalmettoAIAutomation.com](https://palmettoaiautomation.com).

This GitHub repo is the **disaster-recovery snapshot**. The source of truth is the live deployment on the VPS — see "Editing the live site" below.

## Site architecture (one paragraph)

Boron-Letters chassis. URL pattern: `/letters/[slug]` and `/clusters/[slug]`. Six page archetypes (Landing Letter, Symptom Letter, Protocol Letter, Founder Story, Cluster Pillar, Resources Hub). Single off-site CTA: `/follow` 301-redirects to Instagram. No email forms, no popups, no exit-intent. Single-author voice (Marlowe Bennett) — never represent her as a clinician.

See `HHI_SALES_BLOG_ARCHITECTURE.md` and `HHI_LETTER_01_THE_4AM_LETTER.md` (kept locally on the maintainer's machine, not in this repo) for the full spec.

## Hosting stack

| Layer | Where |
| --- | --- |
| Origin | MassiveGRID Cloud VPS, 172.82.66.246 (`palmetto-vps-01`) |
| Web server | Caddy 2 at `/etc/caddy/Caddyfile` |
| Document root | `/var/www/HerHormoneInsider.com/` |
| TLS at origin | Caddy local CA (paired with Cloudflare "Full" mode) |
| CDN / DNS | Cloudflare (Limitless Life LLC account) |
| Registrar | Namecheap (nameservers point to Cloudflare) |

## Edit pattern — direct on VPS

For most edits (typos, copy tweaks, single-letter additions), work directly on the VPS via SSH. Caddy serves from disk; changes are live immediately, no rebuild.

```bash
ssh -i ~/.ssh/massivegrid_palmetto root@172.82.66.246
cd /var/www/HerHormoneInsider.com
# edit files in place
exit
```

When you do edit on the VPS, mirror the change back to this repo afterward (next section).

## Edit pattern — full rebuild from scratch

For a rebuild — new letters, design system changes, schema updates — use the deploy bundle on the maintainer's Mac at `~/projects/hhi-deploy/`:

```bash
cd ~/projects/hhi-deploy
./deploy.sh             # full pipeline: build → compress → push to VPS → mirror to GitHub
./deploy.sh --no-push   # build + push to VPS, skip GitHub mirror
./deploy.sh --dry-run   # build only, output in /tmp/hhi-build/
```

The bundle:
- `scripts/` — Python build scripts (page generation, image placeholders, prefix handling)
- `static/` — CSS, JS, llms.txt, favicon (copied as-is into the build)
- `deploy.sh` — orchestration

## Path-prefix gotcha

This repo's HTML files contain **absolute paths prefixed with `/HerHormoneInsider.com/`** (e.g., `/HerHormoneInsider.com/css/main.css`) so the GitHub Pages preview at `palmettoai.github.io/HerHormoneInsider.com/` works.

The VPS production site uses the same files with the prefix **stripped** (`/css/main.css`).

If you pull from this repo to the VPS manually:

```bash
ssh root@172.82.66.246 \
  'cd /var/www/HerHormoneInsider.com && find . -name "*.html" -not -path "./.git/*" -exec sed -i "s|/HerHormoneInsider.com/|/|g" {} \;'
```

The `deploy.sh` flow handles this automatically — build is done with non-prefixed paths, then the GitHub mirror gets prefixed via `scripts/hhi-prefix.py` before commit.

## Owner-pending items

These are tracked inline in the source files with `OWNER:` comments and `[mailing address pending]` placeholders. The site is shippable without them but should be filled in before public marketing pushes.

- Real Marlowe Bennett headshot photo (currently a monogram placeholder at `/img/marlowe-headshot.jpg`)
- Custom OG image art (text-only fallbacks at `/og/letter-01-4am.jpg`, etc.)
- GA4 Measurement ID (currently `G-XXXXXXXXXX` placeholder in `<head>` of every page)
- Mailing address for the footer trust signal
- Final outbound link approvals on Letter #1 (Harvard Health + PubMed cortisol study, defaults already in place)

## Hard rules — do not violate

These are not stylistic preferences. They were explicitly removed by the client and must not be added back:

- ❌ "Medically reviewed" badges anywhere
- ❌ Fictional doctor reviewer names in bylines or footers
- ❌ `reviewedBy` field in JSON-LD schema
- ❌ Email signup forms anywhere on the site
- ❌ Exit-intent popups
- ❌ Mobile sticky CTA bars (except the future Protocol Letter, which doesn't exist yet)
- ❌ Newsletter banners
- ❌ Countdown timers, "limited spots", or any pressure tactic
- ❌ Stock photography of women or medical iconography

Any trust signaling uses these phrases instead: "reader-supported", "independent", "no pharmaceutical advertising", "we are journalists, not clinicians".

## Files & structure

```
/                                  homepage Landing Letter
/letters/                          library index
/letters/the-4am-letter/           Letter #1 (cornerstone)
/letters/the-belly-letter/         Letter #2
/letters/why-your-labs-are-normal/ Letter #3
/letters/how-i-got-here/           Founder story
/letters/the-protocol-letter/      Sales page (stub until product exists)
/clusters/sleep-and-cortisol/      Cluster pillar
/start-here/                       New-reader routing
/about/, /privacy/, /terms/,
/disclaimer/, /contact/            Editorial standards + policy pages
/resources/                        Affiliate hub (noindex until populated)
/follow                            301 → instagram.com/HealthierLivingDaily
/feed.xml                          Atom 1.0 feed
/llms.txt                          AI-search GEO file
/sitemap.xml, /robots.txt          standard SEO
/css/main.css                      single stylesheet
/js/main.js                        deferred, ~3KB minified
/fonts/source-serif-4-*.woff2      self-hosted variable font
/img/, /og/                        images
```

## Disaster recovery from this repo

If the VPS is destroyed and you need to rebuild from this repo:

1. Spin up a new Caddy host and copy `/etc/caddy/Caddyfile` (kept in maintainer's password manager).
2. Clone this repo to `/var/www/HerHormoneInsider.com/`.
3. Run the prefix-stripper (see "Path-prefix gotcha" above).
4. `chown -R caddy:caddy /var/www/HerHormoneInsider.com/`
5. `systemctl reload caddy`.

The site has no database, no backend, no build dependencies in production — it's just files served by Caddy.
