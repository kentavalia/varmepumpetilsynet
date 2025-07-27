# 🚀 Enkel Railway Deployment (Uten GitHub)

## Metode 1: Railway CLI (Enklest)
1. Last ned `varmepumpetilsynet-clean.zip` fra Replit
2. Pakk ut på din maskin
3. Installer Railway CLI: `npm install -g @railway/cli` 
4. I prosjektmappen: `railway login`
5. Kjør: `railway deploy`

## Metode 2: Railway Dashboard Upload  
1. Gå til Railway dashboard
2. "New Project" → "Empty Project"
3. Last opp ZIP-filen direkte
4. Railway oppdager automatisk Node.js

## Metode 3: Alternativer til Railway

### Render (Anbefalt - enklere enn Railway)
1. Gå til render.com
2. "New" → "Web Service" 
3. "Deploy an existing image" eller "Connect repository"
4. Last opp ZIP eller koble til senere

### Fly.io (CLI-basert, svært kraftig)
1. Installer: `npm install -g @fly.io/flyctl`
2. `flyctl auth signup`
3. I prosjektmappen: `flyctl launch`
4. Følg instruksjonene

## Miljøvariabler som trengs:
- `NODE_ENV=production`
- `SESSION_SECRET=your-secret-key`
- `DATABASE_URL=postgres://...` (Railway kan gi deg dette)

Railway og Render tilbyr gratis PostgreSQL databaser!