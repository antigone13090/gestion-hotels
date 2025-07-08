# Gestion Chaîne d’Hôtels

Une application full-stack pour gérer :
- Réservations
- Annulations
- Arrivées
- Prestations de service
- Facturation
- Rapports (liste journalière, bilan trimestriel)

Backend : Node.js + Express + MySQL  
Frontend : HTML/CSS/JS (Bootstrap) servi statiquement

---

## 📋 Prérequis

- Node.js ≥ 16
- MySQL/MariaDB
- npm ou yarn
- (optionnel) Git/GitHub pour versionner

---

## ⚙️ Installation

1. **Cloner** le dépôt
   ```bash
   git clone git@github.com:antigone13090/gestion-hotels.git
   cd gestion-hotels
   ```
2. **Installer** les dépendances
   ```bash
   npm install
   ```
3. **Configurer** la connexion à la base  
   Copier `.env.example` en `.env` et compléter :
   ```dotenv
   DB_HOST=localhost
   DB_USER=hotel_user
   DB_PASS=motdepasse
   DB_NAME=gestion_hotels
   ```
4. **Créer** la base et les tables
   ```sql
   SOURCE ./sql/schema.sql;
   SOURCE ./sql/triggers.sql;
   SOURCE ./sql/data.sql;
   ```

---

## ▶️ Lancement

```bash
npm start
```

- API : http://localhost:3000
- UI  : http://localhost:3000

---

## 🗂 Structure du projet

```
.
├─ index.js
├─ package.json
├─ .env           # Variables d'environnement
└─ public/
   └─ index.html
```

---

## 🚀 Endpoints

| Route                    | Méthode | Description                                       |
|--------------------------|---------|---------------------------------------------------|
| POST `/login`             | POST    | Authentification (admin/secret)                   |
| POST `/reserve`           | POST    | Créer une réservation                             |
| POST `/annuler`           | POST    | Enregistrer une annulation                        |
| POST `/arrivee`           | POST    | Enregistrer une arrivée                           |
| POST `/service`           | POST    | Ajouter un service                                |
| POST `/facturation`       | POST    | Générer une facture                               |
| GET `/rapport/journaliere`| GET     | Liste journalière                                 |
| GET `/rapport/trimestriel`| GET     | Bilan trimestriel                                 |

---

## 🤝 Contribution

1. Fork le dépôt
2. `git checkout -b feat/xyz`
3. `git commit -m "feat: …"`
4. `git push origin feat/xyz`
5. Ouvrir un Pull Request

---

## 📜 Licence

MIT © antigone13090
