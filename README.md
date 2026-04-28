# Her Hormone Insider

Editorial publication on hormone health for women 35–60. Coverage of perimenopause, menopause, HRT, and the telehealth pathways that prescribe modern, evidence-based regimens.

## Status

Static framework + visual identity. **Not deployed yet.** The plan is to wire this to a Railway service or VPS later, at which point the SEO content pipeline (cron-driven article generation, sitemap rebuilds, indexnow pings) will be added on top of the existing static structure.

## Stack

- Static HTML / CSS / vanilla JS — no build step
- Fraunces (display serif) + Inter (sans) via Google Fonts
- No frameworks, no node_modules
- Deploys cleanly to GitHub Pages, Cloudflare Pages, Netlify, or any static host
- Future Railway/VPS wiring will add a small Node or Python sidecar for content generation; the static front-end stays as is

## Structure

```
/                              homepage (editor's letter, latest, topics, newsletter)
/articles/                     long reads (perimenopause, online HRT, cost & insurance)
/compare/                      side-by-side provider comparisons
/about/                        editorial standards, reviewers, disclosures
/assets/css/style.css          single stylesheet
/assets/js/main.js              minimal interactivity (menu toggle, newsletter)
/robots.txt                    crawl directives
/sitemap.xml                   sitemap (manual for now; will be generated later)
```

## Editorial archetype

Editorial wellness magazine. Warm cream / dusty rose / deep plum palette. Serif display + sans body. "Medically reviewed" badges. No pharma-ad styling.

Differentiator vs. other PalmettoAI client sites: this is the first Fraunces-driven editorial archetype in the org; existing client sites are largely Next.js + Tailwind app-style layouts.

## Roadmap (post-deploy)

1. Wire to Railway service (Cloudflare DNS via Tdeniz1 / domain registrar)
2. Add cron-based content generator using the SEO blog playbook
3. Hook newsletter form to a real list provider (likely Buttondown or Resend + Supabase)
4. Add GSC verification + sitemap submission
5. Light page-speed pass + LCP image optimization for the hero gradient blocks
