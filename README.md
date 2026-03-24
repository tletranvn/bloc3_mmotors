M-Motors - Plateforme de Vente et Location de Véhicules

Il s'agit d'une application web pour la vente et la location longue durée de véhicules,
développée avec Symfony 7.4 et React 19.

I. DESCRIPTION

M-Motors est une plateforme permettant de :
- Consulter un catalogue de véhicules
- Soumettre des demandes d'achat ou de location longue durée
- Gérer des contrats de location actifs
- Administrer les véhicules, les demandes clients et les contrats

II. UTILISATEURS

| Rôle | Accès |
|------|-------|
| Visiteur | Consultation du catalogue |
| Client | Catalogue + soumission de demandes |
| Administrateur | Gestion complète de la plateforme |

---

III. STACK TECHNIQUE

A. Backend

| Technologie | Version |
|-------------|---------|
| PHP | 8.3 |
| Symfony | 7.4 |
| API Platform | 4 (REST JSON-LD/Hydra) |
| PostgreSQL | 17 |
| PHPUnit | 12 (couverture >= 80%) |

B. Frontend

| Technologie | Version |
|-------------|---------|
| React | 19 |
| TypeScript | 5.9 |
| Vite | 7 |
| React Router | v7 |
| React Query | v5 |
| React Hook Form + Zod | - |
| TailwindCSS | v4 |
| Vitest + React Testing Library | (couverture >= 80%) |

C. INFRASTRUCTURE

| Service | Image Docker |
|---------|-------------|
| PHP-FPM | php:8.3-fpm-alpine |
| Nginx | nginx:alpine |
| PostgreSQL | postgres:17-alpine |
| Node.js | node:22-alpine |

---

IV. PRÉREQUIS

Seuls Docker et Git sont requis :

- Docker >= 24.0
- Docker Compose >= 2.0
- Git >= 2.0

PHP, Node.js et Composer sont inclus dans les containers Docker.

---

V. INSTALLATION

1. Cloner le dépôt

```bash
git clone https://github.com/tletranvn/bloc3_mmotors.git
cd bloc3_mmotors
```

2. Configurer les variables d'environnement

```bash
cp .env.example .env
# Éditer .env avec vos valeurs (DATABASE_URL, JWT_PASSPHRASE, etc.)
```

3. Démarrer les containers

```bash
docker compose up -d --build
```

4. Installer les dépendances

```bash
docker compose exec php composer install
docker compose exec node npm install
```

5. Initialiser la base de données

```bash
docker compose exec php php bin/console doctrine:migrations:migrate
```

---

VI. ACCES

| Service | URL |
|---------|-----|
| Frontend React | http://localhost:5175 |
| Backend API | http://localhost:8082/api |
| API Docs (Swagger) | http://localhost:8082/api/docs |
| PostgreSQL | localhost:5434 |

---

VII. STRUCTURE DU PROJET

```
bloc3_mmotors/
├── backend/          # Symfony 7.4 (API Platform)
│   ├── src/
│   ├── tests/
│   └── ...
├── frontend/         # React 19 + TypeScript
│   ├── src/
│   ├── tests/
│   └── ...
├── docker/           # Configuration Docker
│   ├── php/
│   ├── nginx/
│   └── node/
├── .github/          # GitHub Actions (CI)
│   └── workflows/
├── compose.yaml      # Docker Compose
└── README.md
```

---

VIII. COMMANDES UTILES

1. Backend (Symfony)

```bash
# Lancer les tests avec couverture
docker compose exec php php bin/phpunit --coverage-text

# Console Symfony
docker compose exec php php bin/console <commande>

# Créer et exécuter une migration
docker compose exec php php bin/console make:migration
docker compose exec php php bin/console doctrine:migrations:migrate
```

2. Frontend (React)

```bash
# Tests avec couverture (échoue si < 80%)
docker compose exec node npm run test:coverage

# Lint ESLint
docker compose exec node npm run lint

# Build production
docker compose exec node npm run build
```

3. Docker

```bash
# Démarrer / Arrêter
docker compose up -d
docker compose down

# État des containers
docker compose ps

# Logs en temps réel
docker compose logs -f
```

---

IX. Qualité

| Outil | Seuil | Commande |
|-------|-------|---------|
| PHPUnit | >= 80% | `docker compose exec php php bin/phpunit --coverage-text` |
| ESLint | 0 erreur | `docker compose exec node npm run lint` |
| Vitest | >= 80% | `docker compose exec node npm run test:coverage` |

---

X. CI/CD

Deux workflows GitHub Actions se déclenchent automatiquement sur push vers `master`, `main` ou `dev` :

| Workflow | Déclencheur | Jobs |
|----------|-------------|------|
| Backend CI | `backend/**` modifié | PHPUnit |
| Frontend CI | `frontend/**` modifié | ESLint + TypeScript + Vitest |

---

XI. Licence MIT