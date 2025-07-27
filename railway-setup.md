# Railway Setup Guide for Varmepumpetilsynet

## Steg 1: Last ned prosjektet
1. Last ned filen `varmepumpetilsynet-full-project.tar.gz` fra Replit
2. Pakk ut filen på din lokale maskin

## Steg 2: Last opp til GitHub
1. Gå til https://github.com/new
2. Lag nytt repository med navn: `varmepumpetilsynet`
3. Velg "Public" eller "Private" som du ønsker
4. **IKKE** velg "Add README" - vi har allerede filer
5. Klikk "Create repository"

## Steg 3: Last opp filene
1. Klikk "uploading an existing file" på GitHub
2. Dra alle filene fra det utpakkede prosjektet til GitHub
3. Skriv commit message: "Initial commit - Varmepumpetilsynet app"
4. Klikk "Commit changes"

## Steg 4: Railway deployment
1. Gå til Railway dashboard (railway.app)
2. Klikk "New Project"
3. Velg "Deploy from GitHub repo"
4. Velg ditt `varmepumpetilsynet` repository
5. Railway vil automatisk oppdage det er en Node.js app

## Steg 5: Konfigurer miljøvariabler i Railway
Gå til Settings > Variables og legg til:
- `NODE_ENV=production`
- `DATABASE_URL` (Railway kan gi deg en PostgreSQL database)
- `SESSION_SECRET=din-hemmelige-nøkkel-her`

## Steg 6: Database setup
1. I Railway, legg til PostgreSQL tjeneste
2. Kopier DATABASE_URL fra PostgreSQL tjenesten
3. Lim inn i environment variables

Railway vil automatisk deploye appen og gi deg en live URL!