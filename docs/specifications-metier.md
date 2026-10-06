# FactoryFlow — Spécifications Métier & Exigences Techniques

> **Ticket Jira associé :** [FA-11 - Extraction des règles métier et des exigences techniques](https://abiratkhadija-1788780331877.atlassian.net/browse/FA-11)  
> **Auteure :** Khadija Abirat  
> **Date :** 05/10/2026 - 06/10/2026  

---

## 1. Contexte du Projet
Une entreprise industrielle basée à Safi fabrique des produits finis à partir de matières premières. Auparavant, le manque de centralisation entraînait des ruptures lors du lancement des ordres de fabrication (OF) et un défaut de visibilité sur les stocks.  
**FactoryFlow** est l'API backend sécurisée conçue pour centraliser le pilotage de la production, fiabiliser les stocks et tracer l'intégralité des flux.

---

## 2. Règles Métier (Business Rules)

### 2.1 Matières Premières & Gestion des Stocks
* **Unicité des références :** Chaque matière première possède un code/référence unique dans le système.
* **Attributs obligatoires :** Nom, référence, unité de mesure (ex: kg, litre, unité), quantité disponible et seuil d'alerte.
* **Contraintes sur les valeurs :**
  * Stock initial $\ge 0$.
  * Seuil d'alerte $\ge 0$.
  * Quantités d'entrées de stock $> 0$ (strictement positives).
* **Alertes de stock :** L'API doit permettre d'identifier immédiatement les matières premières dont le stock disponible est inférieur ou égal à leur seuil d'alerte.
* **Traçabilité des mouvements :** Tout ajout (entrée) ou consommation (sortie) génère un enregistrement immuable (type, quantité, auteur, date, ordre lié si sortie).

### 2.2 Produits & Compositions (Nomenclature / BOM)
* **Unicité des références produit :** La référence produit est unique.
* **Règle de composition minimale :** Un produit doit utiliser **au moins une** matière première existante.
* **Non-redondance :** Une même matière première ne peut figurer qu'**une seule fois** dans la composition d'un produit.
* **Quantité de composition :** Les quantités unitaires nécessaires pour fabriquer une unité de produit doivent être strictement positives ($> 0$).

### 2.3 Ordres de Fabrication (OF) & Snapshot
* **Copie figée (Snapshot) :** À la création d'un ordre de fabrication, une copie exacte de la composition du produit est figée dans l'ordre. Toute modification ultérieure de la composition du produit n'altère en aucun cas les ordres déjà créés.
* **Cycle de vie strict des statuts :**
  $$\text{planifié} \longrightarrow \text{en cours} \longrightarrow \text{terminé}$$
* **Annulation d'un ordre :** Seul un ordre au statut `planifié` peut être annulé (statut `annulé`). Un ordre `en cours` ou `terminé` ne peut être annulé.
* **Attribution :** Chaque ordre est créé par un Admin et affecté à un opérateur précis.

### 2.4 Démarrage d'un Ordre & Cohérence Atomique du Stock
* **Calcul des besoins :**
  $$\text{Besoin total (matière } i) = \text{Quantité unitaire} \times \text{Quantité à fabriquer}$$
* **Vérification préalable :** Le stock disponible de chaque matière nécessaire est contrôlé avant toute modification.
* **Règle de blocage :** Si une seule matière première est en quantité insuffisante :
  * Le démarrage est refusé.
  * **Aucune déduction de stock n'est effectuée** (zéro modification partielle).
* **Exécution atomique :** Si toutes les matières sont disponibles :
  * Déduction immédiate des quantités requises du stock de chaque matière.
  * Création des mouvements de stock de type `sortie`.
  * Passage du statut de l'ordre à `en cours` avec horodatage de la date de démarrage.
  * L'ensemble de ces opérations s'effectue dans une transaction atomique.
* **Protection anti-double démarrage :** Une seconde tentative de démarrage d'un ordre déjà en cours ou terminé est systématiquement refusée et ne déduit jamais le stock une seconde fois.

### 2.5 Clôture d'un Ordre
* Un opérateur ne peut clôturer qu'un ordre qui lui est affecté et qui est au statut `en cours`.
* La clôture passe le statut à `terminé` et enregistre la date de fin effective.

### 2.6 Installation Initiale via API
* `GET /api/installation/status` : Indique si le système est déjà installé (`installed: boolean`).
* `POST /api/installation` : Permet l'initialisation unique :
  * Réception du nom, e-mail et mot de passe du premier administrateur.
  * Hachage du mot de passe (bcrypt) et création du compte Admin.
  * Verrouillage durable de l'état d'installation.
  * Toute tentative ultérieure d'installation est rejetée (code HTTP 400/409).
  * En cas d'échec durant l'installation, aucun compte ou état partiel n'est conservé (rollback).

---

## 3. Matrice des Rôles & Permissions (RBAC)

| Fonctionnalité / Endpoint | Rôle Admin | Rôle Opérateur | Non authentifié |
| :--- | :---: | :---: | :---: |
| Installation (`/api/installation/*`) | N/A (système) | N/A (système) | ✅ (si non installé) |
| Connexion (`/api/auth/login`) | ✅ | ✅ | ✅ |
| Consultation de son profil (`/api/auth/profile`) | ✅ | ✅ | ❌ |
| Création d'utilisateurs (`/api/users`) | ✅ | ❌ | ❌ |
| CRUD Matières premières | ✅ | ❌ | ❌ |
| Enregistrement des entrées de stock | ✅ | ❌ | ❌ |
| Consultation de tous les mouvements de stock | ✅ | ❌ | ❌ |
| CRUD Produits & Compositions | ✅ | ❌ | ❌ |
| Création, modification, annulation d'OF planifiés | ✅ | ❌ | ❌ |
| Consultation globale de tous les OF (filtres, pagination) | ✅ | ❌ | ❌ |
| Consultation de ses propres OF affectés | ❌ (ou via filtres) | ✅ | ❌ |
| Démarrage d'un OF affecté | ❌ | ✅ | ❌ |
| Clôture d'un OF affecté | ❌ | ✅ | ❌ |
| Historique personnel des OF terminés | ❌ | ✅ | ❌ |

---

## 4. Exigences Techniques & Architecture

### 4.1 Technologies
* **Environnement d'exécution :** Node.js
* **Framework Web :** Express.js
* **Base de données :** MongoDB avec l'ODM Mongoose
* **Sécurité :** Authentification par JSON Web Token (JWT), hachage bcryptjs
* **Tests unitaires :** Jest (simulation / mock des repositories pour isoler les services)
* **Documentation API :** Swagger / OpenAPI (via Swagger UI Express & YAML)
* **DevOps :** Docker, Docker Compose (`compose.yaml`) avec persistance MongoDB et hot-reload (nodemon)

### 4.2 Architecture Multicouche (Layered Architecture)
```
src/
├── config/        # Variables d'environnement & connexion MongoDB
├── controllers/   # Gestion des requêtes/réponses HTTP
├── services/      # Logique métier & application des règles
├── repositories/  # Accès aux données MongoDB (abstractions ODM)
├── models/        # Schémas et modèles Mongoose
├── middlewares/   # Auth JWT, RBAC, validation, errorHandler global
├── routes/        # Définition des routes de l'API
└── utils/         # Helpers & constantes
```

### 4.3 Gestion des Erreurs & Réponses HTTP
* Validation stricte des corps de requêtes (bad request $\rightarrow$ 400).
* Accès non authentifié $\rightarrow$ 401 Unauthorized.
* Droits insuffisants (mauvais rôle / mauvais opérateur) $\rightarrow$ 403 Forbidden.
* Ressource introuvable $\rightarrow$ 404 Not Found.
* Conflits métier (référence déjà existante, état invalide, réinstallation) $\rightarrow$ 409 Conflict.
* Middleware d'erreurs centralisé renvoyant un format JSON standardisé :
  ```json
  {
    "success": false,
    "error": {
      "message": "Description explicite de l'erreur",
      "code": "CODE_ERREUR"
    }
  }
  ```
