---
title: Application de Chat par Groupes - YMCHAT
author:  
 Youssef Morchid || youssef.morchid@grenoble-inp.org
--- 

# Application de Chat par Groupes

Application web full-stack permettant la gestion de groupes de discussion en temps réel avec système d'authentification et de permissions.
L'application est accessible sur  https://morchidy.github.io/YMCHAT/

## Table des matières

- [Installation](#installation)
- [Cahier des charges](#cahier-des-charges)
- [Architecture du code](#architecture-du-code)
- [Gestion des rôles et droits](#gestion-des-rôles-et-droits)
- [Tests](#tests)
- [Intégration et déploiement](#intégration--déploiement)
- [Documentation API](#documentation-api)
- [Données de test](#données-de-test)

## Installation

### Prérequis

- Node.js (version 16 ou supérieure)
- npm
- SQLite3

### Installation sur machine nue

```bash
# Cloner le dépôt
git clone [URL_DU_DEPOT]
cd YMCHAT

# Installation et lancement du backend
cd backend
npm install
npm run start

# Installation et lancement du frontend (nouveau terminal)
cd frontend
npm install
npm run dev

# Lancement des tests backend
cd backend
npm test

# Lancement des tests frontend
cd frontend
npm test

# Accès à la documentation Swagger
firefox https://ymchat.osc-fr1.scalingo.io/docs
```

L'application sera accessible sur :
- Frontend : `http://localhost:5173`
- Backend : `http://localhost:3000`
- API Documentation : `http://localhost:3000/docs`

## Cahier des charges

### Description du projet

Application de messagerie instantanée permettant aux utilisateurs de créer et rejoindre des groupes de discussion. Le système propose une gestion complète des utilisateurs avec différents niveaux de permissions et une interface de chat en temps réel.

### Fonctionnalités implémentées

####  Authentification et gestion utilisateurs
- Inscription et connexion sécurisées
- Gestion des profils utilisateurs
- Système de rôles (Admin/Utilisateur standard)
- Validation des mots de passe complexes

####  Gestion des groupes
- Création de groupes par les utilisateurs
- Ajout/suppression de membres
- Gestion des permissions par groupe
- Suppression de groupes (propriétaire uniquement)

####  Messagerie instantanée
- Envoi et réception de messages en temps réel
- Historique des conversations
- Interface de chat intuitive
- Limitation de taille des messages (128 caractères)

####  Administration
- Panel d'administration pour les admins
- Gestion globale des utilisateurs
- Modération des groupes et messages

### Cas d'usage

```plantuml
@startuml
left to right direction
actor "Visiteur" as v
actor "Utilisateur" as u
actor "Admin" as a
actor "Propriétaire Groupe" as pg

u <|-- a
u <|-- pg

rectangle "Application de Chat" {
  usecase "S'inscrire" as UC1
  usecase "Se connecter" as UC2
  usecase "Créer un groupe" as UC3
  usecase "Rejoindre un groupe" as UC4
  usecase "Envoyer message" as UC5
  usecase "Ajouter membre" as UC6
  usecase "Supprimer membre" as UC7
  usecase "Supprimer groupe" as UC8
  usecase "Gérer utilisateurs" as UC9
  usecase "Changer rôle" as UC10
}

v --> UC1
v --> UC2
u --> UC3
u --> UC4
u --> UC5
pg --> UC6
pg --> UC7
pg --> UC8
a --> UC9
a --> UC10
@enduml
```

### Maquettes

#### Interface principale

```plantuml
@startsalt
<style>
header {
  TextAlignment right
  BackGroundColor #2c3e50
  FontColor white
}
</style>
header {- user@example.com | [Se déconnecter] }
{
{^"Mes Groupes"
**Groupes rejoints**
* Admin Group ✓
* User Group
----
**Groupes administrés**
* Admin Group (Propriétaire)
----
"Nom du nouveau groupe" | [Créer]
}|
{^"Chat - <b>Admin Group"
{SI
[Premier message de test] | Admin User | 10:30
[Deuxième message de test] | Normal User | 10:32
[Salut tout le monde !] | Normal User | 10:35
. | 
----|----
}
"Tapez votre message (max 128 car)..." | [Envoyer]
}|
{^"Membres (2)"
* Admin User (Propriétaire)
* Normal User
----
[+ Ajouter] | [Paramètres]
}
}
@endsalt
```

### Captures d'écran



1. **Page de connexion** :
![alt text](screenshots/ymchat1.png)
![alt text](screenshots/ymchat2.png)
2. **Dashboard principal** :
![alt text](screenshots/ymchat3.png)
3. **Interface de chat** :
![alt text](screenshots/ymchat4.png)
4. **Gestion des groupes** : 
![alt text](screenshots/ymchat5.png)
5. **Panel administrateur** : 
![alt text](screenshots/ymchat6.png)
6. **Version mobile** :
![alt text](screenshots/ymchat7.png)
![alt text](screenshots/ymchat8.png)

### API mise en place

Documentation Swagger complète disponible à : `/docs`

**Endpoints principaux :**

| Méthode | Endpoint | Description | Auth | Rôle requis |
|---------|----------|-------------|------|-------------|
| POST | `/api/users/register` | Inscription | Non | - |
| POST | `/api/users/login` | Connexion | Non | - |
| GET | `/api/users` | Liste utilisateurs | Oui | Admin |
| GET | `/api/groups/my` | Mes groupes | Oui | Utilisateur |
| POST | `/api/groups` | Créer groupe | Oui | Utilisateur |
| DELETE | `/api/groups/:id` | Supprimer groupe | Oui | Propriétaire |
| POST | `/api/groups/:id/members` | Ajouter membre | Oui | Propriétaire |
| DELETE | `/api/groups/:id/members/:userId` | Retirer membre | Oui | Propriétaire |
| GET | `/api/messages/:groupId` | Messages du groupe | Oui | Membre |
| POST | `/api/messages` | Envoyer message | Oui | Membre |

## Architecture du code

### Frontend (React + Vite)

**Organisation du code :**

```bash
frontend/
├── index.html
├── package.json
├── vite.config.js
├── .env.production
├── src/
│   ├── App.css                    # Styles globaux
│   ├── App.jsx                    # Composant racine
│   ├── main.jsx                   # Point d'entrée
│   ├── components/
│   │   ├── GroupChat.jsx          # Interface de chat
│   │   └── RegisterForm.jsx       # Formulaire d'inscription
│   ├── services/
│   │   ├── userService.js         # API utilisateurs
│   │   ├── groupService.js        # API groupes
│   │   └── messageService.js      # API messages
│   └── views/
│       ├── Login.jsx              # Page de connexion
│       └── Accueil.jsx            # Dashboard principal
└── public/
```

**Choix techniques :**
- **React 18** avec hooks pour la gestion d'état
- **Vite** pour le build et développement rapide
- **Fetch API** pour les requêtes HTTP
- **Polling** pour la mise à jour des messages (3s)
- **CSS vanilla** pour le styling

### Backend (Node.js + Express)

#### Schéma de base de données

```plantuml
@startuml
class User {
  +id : INTEGER (PK)
  +nom : VARCHAR(255)
  +email : VARCHAR(255) UNIQUE
  +motDePasse : VARCHAR(255)
  +isAdmin : BOOLEAN
  +createdAt : DATETIME
  +updatedAt : DATETIME
}

class Group {
  +id : INTEGER (PK)
  +nom : VARCHAR(255)
  +description : TEXT
  +ownerId : INTEGER (FK)
  +createdAt : DATETIME
  +updatedAt : DATETIME
}

class Message {
  +id : INTEGER (PK)
  +content : VARCHAR(128)
  +userId : INTEGER (FK)
  +groupId : INTEGER (FK)
  +createdAt : DATETIME
  +updatedAt : DATETIME
}

class GroupMember {
  +id : INTEGER (PK)
  +groupId : INTEGER (FK)
  +userId : INTEGER (FK)
  +createdAt : DATETIME
  +updatedAt : DATETIME
}

User ||--o{ Message : posts
Group ||--o{ Message : contains
User ||--o{ Group : owns
User ||--o{ GroupMember : belongs
Group ||--o{ GroupMember : has
@enduml
```

#### Architecture du code

```bash
backend/
├── .env                           # Variables d'environnement
├── package.json
├── Procfile                       # Configuration Scalingo
├── bd.sqlite                      # Base de données principale
├── bdtest.sqlite                  # Base de données de test
├── swagger_output.json            # Documentation API générée
├── genereBadges.sh               # Script génération badges
├── src/
│   ├── app.js                    # Configuration Express
│   ├── server.js                 # Point d'entrée serveur
│   ├── __tests__/
│   │   ├── api.user.test.js      # Tests API utilisateurs
│   │   ├── api.group.test.js     # Tests API groupes
│   │   └── api.message.test.js   # Tests API messages
│   ├── controllers/
│   │   ├── user.js               # Contrôleur utilisateurs
│   │   ├── groups.js             # Contrôleur groupes
│   │   └── messages.js           # Contrôleur messages
│   ├── models/
│   │   ├── database.js           # Configuration Sequelize
│   │   ├── users.js              # Modèle User
│   │   ├── groups.js             # Modèle Group
│   │   └── messages.js           # Modèle Message
│   ├── routes/
│   │   ├── router.js             # Router principal
│   │   ├── user.js               # Routes utilisateurs
│   │   ├── groups.js             # Routes groupes
│   │   └── messages.js           # Routes messages
│   ├── middleware/
│   │   └── auth.js               # Middleware authentification
│   └── util/
│       ├── updatedb.js           # Initialisation BD
│       ├── catalogue.txt         # Données de test
│       └── swagger.js            # Configuration Swagger
├── coverage/                     # Rapports de couverture
└── log/                         # Logs de l'application
```

**Choix techniques :**
- **Express.js** pour le serveur HTTP
- **Sequelize** ORM avec SQLite
- **JWT** pour l'authentification
- **bcrypt** pour le hachage des mots de passe
- **Swagger** pour la documentation API
- **Jest** pour les tests

## Gestion des rôles et droits

### Côté backend

**Rôles implémentés :**

1. **Utilisateur standard** (`isAdmin: false`)
   - Créer des groupes
   - Rejoindre des groupes (si membre)
   - Envoyer des messages dans ses groupes
   - Gérer ses propres groupes (propriétaire)

2. **Administrateur** (`isAdmin: true`)
   - Tous les droits d'un utilisateur standard
   - Accès à la liste de tous les utilisateurs
   - Gestion globale des utilisateurs
   - Accès aux membres de tous les groupes

**Middleware d'authentification :**

Les middleware dans [`auth.js`](backend/src/middleware/auth.js) gèrent :

- [`verifieTokenPresent`](backend/src/middleware/auth.js) : Vérification du token JWT
- [`verifieAdmin`](backend/src/middleware/auth.js) : Vérification du rôle admin
- [`verifieProprietaireGroupe`](backend/src/middleware/auth.js) : Vérification propriété du groupe
- [`verifieMembreGroupe`](backend/src/middleware/auth.js) : Vérification appartenance au groupe
- [`verifieAccesGroupMembers`](backend/src/middleware/auth.js) : Accès aux membres (admin ou propriétaire)

**Implémentation :**
```javascript
// Exemple de protection d'une route
app.get('/api/users', 
  verifieTokenPresent, 
  verifieAdmin, 
  userController.getUsers
);

app.delete('/api/groups/:id', 
  verifieTokenPresent, 
  verifieProprietaireGroupe, 
  groupController.deleteGroup
);
```

### Côté frontend

**Gestion des permissions :**

Les services frontend dans [`userService.js`](frontend/src/services/userService.js), [`groupService.js`](frontend/src/services/groupService.js) et [`messageService.js`](frontend/src/services/messageService.js) incluent automatiquement le token JWT dans les headers.

**Protection des vues :**
- Redirection vers login si non authentifié
- Masquage des fonctionnalités selon le rôle
- Vérification côté client des permissions (interface)

## Tests

### Backend

**Framework :** Jest avec Supertest

**Couverture actuelle :** Visible dans [coverage/](backend/coverage/)

**Tests implémentés :**

1. **Tests utilisateurs** ([`api.user.test.js`](backend/src/__tests__/api.user.test.js))
   - Inscription avec validation
   - Connexion avec identifiants valides/invalides
   - Gestion des tokens JWT
   - Validation des mots de passe complexes

2. **Tests groupes** ([`api.group.test.js`](backend/src/__tests__/api.group.test.js))
   - Création de groupes
   - Gestion des membres (ajout/suppression)
   - Vérification des permissions propriétaire
   - Suppression de groupes

3. **Tests messages** ([`api.message.test.js`](backend/src/__tests__/api.message.test.js))
   - Envoi de messages
   - Récupération de l'historique
   - Validation des permissions d'accès
   - Limitation taille des messages

**Commandes :**
```bash
cd backend
npm test                    # Tous les tests
npm run test:coverage      # Tests avec couverture
```

**Génération des badges :**
Le script [`genereBadges.sh`](backend/genereBadges.sh) génère automatiquement :
- Badge de statut du pipeline
- Badge de couverture des tests
- Badge de version
- Badge de statut du projet

### Frontend

**Tests en cours d'implémentation**

Prévus :
- Tests des composants React
- Tests d'intégration des services
- Tests des interactions utilisateur

**Commandes :**
```bash
cd frontend
npm test                    # Tests unitaires
npm run test:coverage      # Couverture
```

## Intégration et déploiement

### Intégration Continue (GitHub Actions)

**Pipelines configurés :**

1. **Backend** ([`.github/workflows/deploy-backend.yml`](.github/workflows/deploy-backend.yml))
   - Tests automatiques
   - Génération de la couverture
   - Déploiement sur Scalingo

2. **Frontend** ([`.github/workflows/deploy-frontend.yml`](.github/workflows/deploy-frontend.yml))
   - Build de production
   - Déploiement automatique

### Déploiement sur Scalingo

**Configuration backend :**
- Runtime : Node.js
- Base de données : SQLite (fichier local)
- Variables d'environnement configurées
- Procfile : `web: node src/server.js`

**URLs de déploiement :**
- Backend : `https://ymchat.osc-fr1.scalingo.io`
- Frontend : `https://morchidy.github.io/YMCHAT/`
- Documentation API : `https://ymchat.osc-fr1.scalingo.io/docs`

### Monitoring

- **Logs :** Accessibles via Scalingo dashboard
- **Métriques :** CPU, RAM, requêtes/sec
- **Badges :** Génération automatique du statut

## Documentation API

### Swagger/OpenAPI

Documentation interactive complète disponible à : `/docs`

Générée automatiquement via [`swagger.js`](backend/src/util/swagger.js) et exportée dans [`swagger_output.json`](backend/swagger_output.json)

### Structure des réponses

**Format standard :**
```json
{
  "status": "success|error",
  "message": "Description",
  "data": { /* Données métier */ }
}
```

**Codes de statut :**
- `200` : Succès
- `201` : Création réussie
- `400` : Erreur de validation
- `401` : Non authentifié
- `403` : Accès refusé
- `404` : Ressource non trouvée
- `500` : Erreur serveur

## Données de test

### Comptes par défaut

Consultez [`catalogue.txt`](backend/src/util/catalogue.txt) pour les données d'initialisation :

**Administrateur :**
- Email : `admin@example.com`
- Mot de passe : `admin123`
- Rôle : Admin

**Utilisateur standard :**
- Email : `user@example.com`
- Mot de passe : `user123`
- Rôle : Utilisateur

**Groupes de test :**
- **Admin Group** (propriétaire : Admin, membres : Admin + User)
- **User Group** (propriétaire : User, membres : User)

### Initialisation de la base

Exécuter [`updatedb.js`](backend/src/util/updatedb.js) pour créer les données de test :

```bash
cd backend
node src/util/updatedb.js
```

---

**Version :** 1.0.0  
**Dernière mise à jour :** Août 2025  
**Technologies :** React, Node.js, Express, SQLite, JWT, Swagger  
**Déploiement :** Scalingo - Github pages
