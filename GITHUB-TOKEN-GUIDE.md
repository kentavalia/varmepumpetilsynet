# 🔑 GitHub Personal Access Token Guide

## Steg 1: Lag GitHub Token
1. Gå til https://github.com/settings/tokens
2. Klikk "Generate new token" → "Generate new token (classic)"
3. Gi navn: "Varmepumpetilsynet Upload"
4. Velg scopes:
   - ✅ **repo** (Full control of private repositories)
   - ✅ **workflow** (Update GitHub Action workflows)
5. Klikk "Generate token"
6. **KOPIER TOKEN** - du får ikke se den igjen!

## Steg 2: Kjør Upload Script
1. I Replit terminal: `python3 upload-to-github.py`
2. Lim inn token når den spør
3. Scriptet laster opp hele prosjektet automatisk

## Steg 3: Railway Deployment
1. Gå til Railway dashboard
2. "New Project" → "Deploy from GitHub repo"
3. Velg din nye `varmepumpetilsynet` repository
4. Railway setter opp automatisk med Node.js og PostgreSQL

## Miljøvariabler i Railway
```
NODE_ENV=production
SESSION_SECRET=your-secret-key-here
DATABASE_URL=postgresql://... (Railway gir deg dette)
```

Dette hopper over all manuell nedlasting/utpakking!