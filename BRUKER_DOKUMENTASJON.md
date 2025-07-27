# Varmepumpetilsynet - Brukerdokumentasjon

## Hva er denne appen?

Varmepumpetilsynet er en norsk plattform som kobler sammen varmepumpekunder med sertifiserte installatører. Appen fungerer som en markedsplass hvor:

- **Kunder** kan sende inn anonyme serviceforespørsler uten å registrere seg
- **Installatører** kan registrere seg, administrere serviceområder og motta forespørsler
- **Administratorer** har full oversikt og kontroll over systemet

## Hvordan bruke appen første gang

### 1. Start utviklingsserveren
```bash
npm run dev
```
Appen vil være tilgjengelig på: http://localhost:5000

### 2. Logg inn som administrator
- Gå til: http://localhost:5000/auth
- **Brukernavn:** `admin`
- **Passord:** `admin123`
- **Rolle:** Administrator (full tilgang)

### 3. Utforsk funksjonalitet

**For administratorer (admin/admin123):**
- Administrer installatører (godkjenne, aktivere/deaktivere, slette)
- Se alle serviceforespørsler
- Redigere og slette forespørsler
- Administrere postnummer og koordinater

**For installatører:**
- Registrer ny installatør på /auth (klikk "Opprett ny konto")
- Administrer firmaprofil og kontaktinformasjon
- Velg serviceområder (fylker og kommuner)
- Se relevante serviceforespørsler i ditt område
- Administrer postnummer for nøyaktig kartplassering

**For kunder:**
- Gå til /customer (ingen innlogging kreves)
- Send inn serviceforespørsler anonymt
- Søk etter installatører på /search

## Testbruker informasjon

### Administrator
- **URL:** http://localhost:5000/auth
- **Brukernavn:** `admin`
- **Passord:** `admin123`
- **Tilgang:** Full administrativ tilgang til hele systemet

### Test installatør (hvis opprettet)
- **URL:** http://localhost:5000/auth
- **Brukernavn:** [Opprett ny via registrering]
- **Passord:** [Velg selv under registrering]
- **Tilgang:** Installatørportal med serviceområder og forespørsler

## Hovedfunksjoner

### 1. Anonyme kundeforespørsler
- Kunder trenger ikke registrere seg
- Sender forespørsler via /customer
- Installatører i relevant område får forespørslene

### 2. Installatøradministrasjon
- Registrering av nye installatører
- Godkjenning og aktivering av administratorer
- Profil- og adresseadministrasjon
- Serviceområdevalg per fylke/kommune

### 3. Kartintegrasjon
- Nøyaktige norske koordinater via Kartverket API
- Postnummeradministrasjon med Excel import/eksport
- Visualisering av installatører på kart

### 4. Admin panel
- Full oversikt over alle brukere og forespørsler
- GDPR-kompatibel sletting av data
- Redigering av all informasjon

## Teknisk arkitektur

### Frontend
- **React 18** med TypeScript
- **Vite** for utvikling og bygging
- **TailwindCSS** + **shadcn/ui** for design
- **React Query** for data caching
- **Wouter** for routing

### Backend
- **Express.js** med TypeScript
- **PostgreSQL** database via Neon
- **Drizzle ORM** for database operasjoner
- **bcrypt** for passord kryptering
- **Session-basert** autentisering

### Deployment
- **Replit** hosting platform
- **Produksjonsbygg** via `npm run build`
- **Health checks** på /health og /api/health

## Database setup

Databasen settes opp automatisk når appen starter. Den inneholder:
- **Users:** Brukerkonto informasjon
- **Installers:** Installatør firma data
- **ServiceAreas:** Serviceområder per installatør
- **ServiceRequests:** Kundeforespørsler
- **PostalCodes:** Norske postnummer med koordinater

## Viktige kommandoer

```bash
# Start utvikling
npm run dev

# Bygg for produksjon
npm run build

# Database migrering
npm run db:push

# Database studio (visuell database editor)
npx drizzle-kit studio
```

## Feilsøking

### Vanlige problemer:
1. **Database feil:** Sjekk at DATABASE_URL er satt
2. **Auth feil:** Bruk admin/admin123 for første innlogging
3. **Koordinat feil:** Kartverket API kan være midlertidig utilgjengelig
4. **Build feil:** Kjør `npm run build` for å sjekke TypeScript feil

### Health checks:
- Development: http://localhost:5000/health
- Production: https://dd05e8be-77b6-419a-9968-408662d0b455-00-33p9ad2mbam44.kirk.replit.dev/health

## Filstruktur oversikt

```
├── client/src/          # React frontend
├── server/              # Express backend
├── shared/              # Delte TypeScript typer
├── scripts/             # Database setup skript
├── dist/                # Produksjonsbygg
└── attached_assets/     # Opplastede filer og bilder
```

## Siste endringer (Januar 26, 2025)

- ✅ Fikset serviceområde API dataformat feil
- ✅ Løst frontend routing i produksjon
- ✅ Automatisk norske koordinater via Kartverket
- ✅ Excel import/eksport for postnummer
- ✅ Komplett anonymt kundesystem
- ✅ GDPR-kompatibel datasletting

---

**Laget:** Januar 26, 2025  
**Sist oppdatert:** Januar 26, 2025  
**Versjon:** 1.0 (Produksjonsklar)