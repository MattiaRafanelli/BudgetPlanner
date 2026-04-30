# 🛡️ Admin Authentication System - Setup & Usage

Das Budget Planner Admin-Authentifizierungssystem ist fertig. Hier ist eine vollständige Anleitung zur Einrichtung und Verwendung.

## 📋 Übersicht

- **Admin-Login**: Ein Administrationskonto mit Authentifizierung
- **Benutzerverwaltung**: Der Admin kann Benutzer erstellen, bearbeiten und löschen
- **Erzwungener Passwort-Wechsel**: Beim ersten Login muss das Passwort geändert werden
- **Audit-Protokoll**: Alle Admin-Aktionen werden protokolliert
- **JWT-Authentifizierung**: Sichere Token-basierte Authentifizierung

## ✅ Setup

### 1. Abhängigkeiten installieren

```bash
cd server
npm install
```

Dies installiert:
- `bcrypt` - Passwort-Hashing
- `jsonwebtoken` - JWT-Tokens

### 2. Umgebungsvariablen konfigurieren

Kopieren Sie `.env.example` zu `.env` und aktualisieren Sie:

```bash
cp .env.example .env
```

Bearbeiten Sie `.env`:

```env
# Datenbank
DB_HOST=your_host
DB_PORT=5432
DB_NAME=budgetplanner
DB_USER=your_user
DB_PASSWORD=your_password

# Server
PORT=8081
NODE_ENV=development

# JWT Secret (WICHTIG: ändern Sie dies in Produktion!)
JWT_SECRET=your-super-secret-key-change-in-production

# Admin Initial Password
ADMIN_PASSWORD=Admin123
```

### 3. Datenbank-Migrationen ausführen

Migrationen laufen automatisch beim Starten des Servers:

```bash
npm run dev
```

Die Tabellen werden erstellt:
- `admin_users` - Admin-Konten
- `users` - Von Admin verwaltete Benutzer
- `admin_audit_log` - Audit-Protokoll

### 4. Admin-Benutzer erstellen

Nach der ersten Migration, seeden Sie den Admin-Benutzer:

```bash
npm run seed
```

Dies erstellt:
- **Username**: `admin`
- **Temporary Password**: `Admin123` (oder `ADMIN_PASSWORD` aus .env)

> ⚠️ **WICHTIG**: Der Admin MUSS dieses Passwort beim ersten Login ändern!

## 🚀 Verwendung

### Admin-Login

1. Navigieren Sie zur Anwendung
2. Sie sehen den **Admin-Login-Bildschirm**
3. Geben Sie ein:
   - **Benutzername**: `admin`
   - **Passwort**: `Admin123`
4. Klicken Sie auf **Login**

### Erstes Login - Passwort ändern

Nach dem ersten Login:

1. Sie werden zu einem **Passwort-Änderungsbildschirm** weitergeleitet
2. Geben Sie ein:
   - Aktuelles Passwort: `Admin123`
   - Neues Passwort: (mindestens 8 Zeichen)
   - Passwort bestätigen
3. Klicken Sie auf **Passwort ändern**
4. Nach erfolgreicher Änderung sehen Sie das **Admin-Dashboard**

### Admin-Dashboard - Benutzerverwaltung

Das Admin-Dashboard zeigt:

- **Benutzerstatistiken**: Gesamtbenutzer, aktive Benutzer, müssen Passwort ändern
- **Benutzertabelle**: Mit Aktionen pro Benutzer

#### Benutzer erstellen

1. Klicken Sie auf **➕ Benutzer erstellen**
2. Füllen Sie das Formular aus:
   - **Benutzername**: (erforderlich)
   - **E-Mail**: (optional)
   - **Vorname**: (optional)
   - **Nachname**: (optional)
3. Klicken Sie auf **Benutzer erstellen**
4. Ein temporäres Passwort wird generiert und angezeigt
5. Geben Sie dieses Passwort dem Benutzer sicher weiter

Beispiel temporäres Passwort: `RedFox231`

#### Benutzer bearbeiten

Für jeden Benutzer können Sie:
- **Aktivieren/Deaktivieren**: Benutzer-Status ändern
- **Passwort zurücksetzen**: Neues temporäres Passwort generieren
- **Löschen**: Benutzer permanent löschen

#### Passwort zurücksetzen

1. Klicken Sie **Reset PW** neben dem Benutzer
2. Bestätigen Sie die Aktion
3. Ein neues temporäres Passwort wird generiert
4. Teilen Sie es dem Benutzer sicher mit

## 🔐 Sicherheit

### Passwort-Hashing

- Passwörter werden mit **bcrypt** (10 Runden) gehasht
- Passwörter werden niemals im Klartext gespeichert oder übertragen

### JWT-Tokens

- Tokens haben eine Gültigkeit von **24 Stunden**
- Tokens werden im Browser `localStorage` gespeichert
- Tokens enthalten Admin-Status zur Überprüfung von Berechtigungen

### Audit-Protokoll

Jede Admin-Aktion wird protokolliert:

```sql
SELECT * FROM admin_audit_log ORDER BY created_at DESC;
```

Protokollierte Aktionen:
- `CREATE_USER` - Benutzer erstellt
- `UPDATE_USER` - Benutzer aktualisiert
- `DELETE_USER` - Benutzer gelöscht
- `RESET_PASSWORD` - Passwort zurückgesetzt

## 📡 API-Endpoints

### Authentifizierung

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123"
}
```

Antwort:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": "uuid",
    "username": "admin",
    "mustChangePassword": true
  }
}
```

### Passwort ändern

```
POST /api/auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "currentPassword": "Admin123",
  "newPassword": "NewSecurePassword"
}
```

### Benutzer auflisten

```
GET /api/auth/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Benutzer erstellen

```
POST /api/auth/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

Antwort:

```json
{
  "user": {
    "id": "uuid",
    "username": "john.doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2024-05-06T..."
  },
  "temporaryPassword": "HappyBear456",
  "message": "User created. Share the temporary password securely with the user."
}
```

### Benutzer aktualisieren

```
PUT /api/auth/users/{userId}
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "email": "newemail@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "isActive": true
}
```

### Benutzer löschen

```
DELETE /api/auth/users/{userId}
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Passwort zurücksetzen

```
POST /api/auth/users/{userId}/reset-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Antwort:

```json
{
  "message": "Password reset successfully",
  "temporaryPassword": "SmartTiger789"
}
```

## 🐛 Debugging

### Admin kann sich nicht anmelden

1. Überprüfen Sie, dass der Admin-Benutzer existiert:
   ```sql
   SELECT * FROM admin_users WHERE username = 'admin';
   ```

2. Starten Sie den Seed-Prozess neu:
   ```bash
   npm run seed
   ```

3. Überprüfen Sie die JWT_SECRET in .env

### Migrations funktionieren nicht

1. Überprüfen Sie die Datenbankverbindung:
   ```bash
   npm run dev
   ```

2. Überprüfen Sie die Migrationen manuell:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name IN ('admin_users', 'users', 'admin_audit_log');
   ```

### Token abgelaufen

- Tokens laufen nach 24 Stunden ab
- Der Benutzer muss sich erneut anmelden
- Dies kann in `src/utils/auth.ts` konfiguriert werden

## 📦 Komponenten

### Frontend

- `src/components/auth/AdminLogin.tsx` - Login-Bildschirm
- `src/components/auth/ChangePassword.tsx` - Passwort-Änderung
- `src/components/auth/AdminDashboard.tsx` - Benutzerverwaltung
- `src/components/ui/Alert.tsx` - Alert-Komponente (neu)

### Backend

- `server/src/utils/auth.ts` - Auth-Utilities (Hashing, JWT, Passwörter)
- `server/src/middleware/authMiddleware.ts` - Auth-Middleware
- `server/src/routes/auth.ts` - Auth-Endpoints

## 🎯 Nächste Schritte

1. Passen Sie `JWT_SECRET` für Produktion an
2. Konfigurieren Sie CORS für Ihre Domain
3. Erwägen Sie zusätzliche Authentifizierungsebenen (2FA)
4. Implementieren Sie ein Benutzer-Login-System
5. Fügen Sie Rolle-basierte Zugriffskontrolle (RBAC) hinzu

## 📝 Lizenz

MIT
