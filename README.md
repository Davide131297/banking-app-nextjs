# Next.js Projekt

Dies ist ein [Next.js](https://nextjs.org) Projekt, erstellt mit dem offiziellen Tool [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Loslegen / Entwicklung starten

Starte den Entwicklungsserver mit einem der folgenden Befehle:

```bash
npm run dev
# oder
yarn dev
# oder
pnpm dev
# oder
bun dev
```

Öffne dann im Browser [http://localhost:3000](http://localhost:3000), um das Ergebnis anzusehen.

Du kannst die Seite bearbeiten, indem du die Datei `app/page.tsx` änderst. Die Seite aktualisiert sich automatisch bei Änderungen.

Dieses Projekt verwendet [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts), um die Schriftart [Geist](https://vercel.com/font) automatisch zu optimieren und zu laden – eine neue Schriftfamilie von Vercel.

---

## Arbeiten mit der MySQL-Datenbank im Docker-Container

Um die MySQL-Datenbank zu verwalten, kannst du dich direkt im laufenden MySQL-Container anmelden und deine Datenbanken und Tabellen einsehen.

### 1. In den laufenden MySQL-Container einloggen

```bash
docker exec -it mysql-db mysql -u root -p
```

Anschließend wirst du nach dem Passwort gefragt (in diesem Projekt: `password`).

### 2. Die gewünschte Datenbank auswählen

```sql
USE test_db;
```

### 3. Alle Tabellen in der Datenbank anzeigen

```sql
SHOW TABLES;
```

### 4. Struktur einer Tabelle anzeigen

```sql
DESCRIBE tabellenname;
```

### 5. Daten aus einer Tabelle abfragen

```sql
SELECT * FROM tabellenname LIMIT 10;
```

## Prisma

### Anzeigen der Prisma UI

`npx prisma studio`

### Prisma Migration erstellen

`npx prisma migrate dev --name <migration_name>`

### Prisma neu Generieren

`npx prisma generate`
