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

## Two-actor edit model

There are two people who edit this site, and they have different tools:

### Matt (client) — edits the live VPS directly

Matt uses **SFTP/SSH to the VPS** with FileZilla or similar. He edits HTML files in place at `/var/www/HerHormoneInsider.com/`. Caddy serves from disk, so changes are live within a second. No rebuild step. No GitHub login required.

A plain-English Matt-facing guide lives at `/root/EDIT-GUIDE.md` on the VPS — he sees it the moment he SSHs in. It covers FileZilla setup, what to edit vs. not touch, how to add a new letter, how to test, and how to recover from breakage.

### Deniz (maintainer) — edits source scripts, runs the deploy pipeline

The build pipeline lives at `~/projects/hhi-deploy/` on Deniz's Mac. Source of truth for Deniz-controlled files (schema, CSS, JS, build scripts) lives there, NOT on GitHub. GitHub is just a disaster-recovery mirror.

```bash
cd ~/projects/hhi-deploy
./deploy.sh                  # SAFE — overwrites only build-generated files; preserves Matt's edits
./deploy.sh --diff           # preview what would change without writing
./deploy.sh --full-rebuild   # DESTRUCTIVE — atomic-swap; wipes any VPS-only files (preserved as .old.<ts>)
./deploy.sh --no-push        # skip the GitHub mirror step
./deploy.sh --dry-run        # build only; don't touch VPS or GitHub
```

The bundle:
- `scripts/` — Python build scripts (page generation, image placeholders, prefix handling)
- `static/` — CSS, JS, llms.txt, favicon, `EDIT-GUIDE.md` (copied as-is into the build)
- `deploy.sh` — orchestration

### How the two actors stay out of each other's way

- `./deploy.sh` defaults to **SAFE mode**: rsync without `--delete`. Matt's hand-edited files on the VPS that aren't in the build will not be deleted. Files that exist in both will be overwritten by the build version (so coordinate before redeploying anything Matt has touched).
- `./deploy.sh --full-rebuild` is the destructive one. Use only after coordinating with Matt or after pulling his edits back into the build scripts.
- `./deploy.sh --diff` shows what a SAFE-mode run would overwrite. Always run it first if you're not sure.

For new letters: Matt adds them directly on the VPS in his `/letters/<slug>/` workflow. They live alongside Deniz's letters and survive SAFE-mode rebuilds. Only `--full-rebuild` would wipe them.

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
