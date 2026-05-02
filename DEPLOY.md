# CalyHealth — Deployment Guide

## What works in demo mode (no Stripe / Beluga keys needed)

| Feature | Status |
|---|---|
| Landing page | ✅ Full |
| Treatments page | ✅ Full |
| Health quiz | ✅ Full |
| Sign up / Log in | ✅ Requires Supabase (free) |
| Checkout flow | ✅ Simulates enrollment (no card charged) |
| Patient intake to Beluga | ✅ Mock responses |
| Dashboard (status, messages) | ✅ Mock data |
| Real Stripe payments | 🔧 Add `sk_test_` key to enable |
| Real Beluga prescriptions | 🔧 Set `BELUGA_MOCK=false` + real key |

---

## Step 1 — Set up Supabase (free, ~5 min)

1. Go to [supabase.com](https://supabase.com) → New project
2. Copy your **Project URL** and **anon public key** from Settings → API
3. Go to the **SQL Editor** and run the contents of `supabase/schema.sql`
4. Under Authentication → URL Configuration, add your site URL:
   - `https://calyhealth.com`
   - Redirect URLs: `https://calyhealth.com/api/auth/callback`

---

## Step 2 — Push code to GitHub

```bash
cd /Users/ahsan/Projects/calyhealth-app
git init
git add .
git commit -m "CalyHealth initial deployment"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/calyhealth-app.git
git push -u origin main
```

---

## Step 3 — Deploy on Vercel (free tier works)

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select the `calyhealth-app` repo
3. Vercel auto-detects Next.js — no framework config needed
4. **Before deploying**, add Environment Variables (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL          = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJ...
NEXT_PUBLIC_APP_URL               = https://calyhealth.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = your_stripe_publishable_key   # optional
STRIPE_SECRET_KEY                 = your_stripe_secret_key          # optional
STRIPE_WEBHOOK_SECRET             = your_stripe_webhook_secret      # optional
BELUGA_API_URL                    = https://api.belugahealth.com/v1
BELUGA_API_KEY                    = mock_key_replace_with_real
BELUGA_CAMPAIGN_ID                = your_campaign_id
BELUGA_WEBHOOK_SECRET             = your_beluga_webhook_secret
BELUGA_MED_ID_SEMAGLUTIDE         = med_semaglutide_placeholder
BELUGA_MED_ID_MICB12              = med_micb12_placeholder
BELUGA_MOCK                       = true
```

5. Click **Deploy** — takes ~2 minutes

---

## Step 4 — Connect calyhealth.com

### If your domain is at a registrar (GoDaddy, Namecheap, etc.)

1. In Vercel: Project → Settings → Domains → Add `calyhealth.com` and `www.calyhealth.com`
2. Vercel will show you DNS records to add — typically:

| Type | Name | Value |
|---|---|---|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

3. Add these at your domain registrar's DNS settings
4. DNS propagates in 10–30 min (up to 24h)
5. Vercel auto-provisions a free SSL certificate

### If domain is at Cloudflare

Same DNS records, but set the proxy status to **DNS only** (grey cloud) — Vercel manages SSL.

### Update Supabase redirect URLs after domain goes live

In Supabase → Authentication → URL Configuration:
- Site URL: `https://calyhealth.com`
- Redirect URLs: `https://calyhealth.com/api/auth/callback`

### Update NEXT_PUBLIC_APP_URL in Vercel

Change from `http://localhost:3000` → `https://calyhealth.com` and redeploy.

---

## Step 5 — Enable real Stripe (when ready)

1. Create account at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get your **Secret key** (`sk_live_...`) and **Publishable key** (`pk_live_...`)
3. Add a webhook endpoint: `https://calyhealth.com/api/stripe/webhook`
   - Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy the **Signing secret** from the webhook page
5. Update Vercel env vars and redeploy

---

## Step 6 — Enable real Beluga (after API approval)

1. Set `BELUGA_MOCK=false` in Vercel env vars
2. Fill in `BELUGA_API_KEY`, `BELUGA_CAMPAIGN_ID`, `BELUGA_WEBHOOK_SECRET`, `BELUGA_MED_ID_SEMAGLUTIDE`, `BELUGA_MED_ID_MICB12` with values from your Beluga partner dashboard
3. Add Beluga webhook endpoint: `https://calyhealth.com/api/clinical/webhook`
4. Redeploy

---

## Local development

```bash
cd /Users/ahsan/Projects/calyhealth-app
npm run dev
# Visit http://localhost:3000
```

Edit `.env.local` with real Supabase credentials. Stripe and Beluga run in demo/mock mode automatically unless real keys are added.
