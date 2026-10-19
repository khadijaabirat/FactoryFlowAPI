/**
 * Script pour transformer toutes les sous-tâches Jira en véritables User Stories
 * avec des dates de réalisation échelonnées et réalistes (Octobre 2026).
 * Usage: node scripts/update-jira-user-stories.js
 */

const https = require('https');

const EMAIL = 'abiratkhadija@gmail.com';
const TOKEN = 'ATATT3xFfGF00pnk6pGwND_OAlI8DajQhQKylYUgIMSXgCvHGXhmFazYmNKEXEYXIzg8nVEkTNhqIDl_VdcD5iHQbka-zsXtX2Tr1JC5y-6_v4UB8hTzcqayCJKrGAUgfVwhicn4g4AuvlHtV6RyiLSbgJMqUiD0uo_tZI3GL07mGqHD01Zn5jY=E38E7457';
const DOMAIN = 'abiratkhadija-1788780331877.atlassian.net';
const AUTH = Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64');

function callJira(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DOMAIN,
      path,
      method,
      headers: {
        'Authorization': `Basic ${AUTH}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function makeUserStoryAdf(startDate, dueDate, role, action, benefit, criteria) {
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: `📅 Période de réalisation : Du ${startDate} au ${dueDate}`, marks: [{ type: 'strong' }] }
        ]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'En tant que : ', marks: [{ type: 'strong' }] },
          { type: 'text', text: role }
        ]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Je souhaite : ', marks: [{ type: 'strong' }] },
          { type: 'text', text: action }
        ]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Afin de : ', marks: [{ type: 'strong' }] },
          { type: 'text', text: benefit }
        ]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: "Critères d'acceptation :", marks: [{ type: 'strong' }] }
        ]
      },
      {
        type: 'bulletList',
        content: criteria.map(c => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: c }]
            }
          ]
        }))
      }
    ]
  };
}

function makeEpicAdf(startDate, dueDate, objectif, livrables) {
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: `📅 Période globale du Sprint : Du ${startDate} au ${dueDate}`, marks: [{ type: 'strong' }] }
        ]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Objectif de l Épic : ', marks: [{ type: 'strong' }] },
          { type: 'text', text: objectif }
        ]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Livrables attendus :', marks: [{ type: 'strong' }] }
        ]
      },
      {
        type: 'bulletList',
        content: livrables.map(l => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: l }]
            }
          ]
        }))
      }
    ]
  };
}

// Dictionnaire détaillé de chaque ticket
const STORIES = {
  // EPIC 1
  'FA-9': {
    isEpic: true, start: '01/10/2026', due: '04/10/2026', duedate: '2026-10-04',
    obj: 'Analyse approfondie du cahier des charges de l usine mécanique de Safi et conception du modèle de domaine.',
    livrables: ['Cahier des charges fonctionnel', 'Diagramme de classes UML avec BOM et multi-produits', 'Planning prévisionnel']
  },
  'FA-10': {
    start: '01/10/2026', due: '02/10/2026', duedate: '2026-10-02',
    role: 'Analyste Métier',
    action: 'analyser le cahier des charges de l usine mécanique de Safi',
    benefit: 'identifier les exigences fonctionnelles et les contraintes de production',
    criteria: ['Exigences des ordres de fabrication recensées', 'Gestion des stocks et nomenclatures documentée']
  },
  'FA-11': {
    start: '01/10/2026', due: '02/10/2026', duedate: '2026-10-02',
    role: 'Analyste Métier',
    action: 'extraire les règles métier et les contraintes de fabrication',
    benefit: 'sécuriser le processus de commande et éviter les ruptures de stock',
    criteria: ['Règle de déduction atomique définie', 'Règle de non-modification des ordres lancés validée']
  },
  'FA-12': {
    start: '02/10/2026', due: '03/10/2026', duedate: '2026-10-03',
    role: 'Responsable Sécurité & Méthodes',
    action: 'définir la matrice des rôles et des permissions (RBAC)',
    benefit: 'garantir que seuls les administrateurs planifient et que les opérateurs exécutent',
    criteria: ['Rôle ADMIN doté des pleins pouvoirs', 'Rôle OPERATOR limité à ses ordres et au stock']
  },
  'FA-13': {
    start: '02/10/2026', due: '03/10/2026', duedate: '2026-10-03',
    role: 'Concepteur Logiciel',
    action: 'concevoir le Diagramme de Classes UML complet',
    benefit: 'disposer d une architecture claire avant le développement',
    criteria: ['Prise en compte des ordres multi-produits', 'Snapshot figé des matières intégrées']
  },
  'FA-14': {
    start: '03/10/2026', due: '03/10/2026', duedate: '2026-10-03',
    role: 'Concepteur Logiciel',
    action: 'modéliser les entités principales et leurs attributs',
    benefit: 'structurer les données de manière cohérente',
    criteria: ['Attributs des entités User, Material, Product, Order', 'Contraintes de validation spécifiées']
  },
  'FA-15': {
    start: '03/10/2026', due: '04/10/2026', duedate: '2026-10-04',
    role: 'Concepteur Logiciel',
    action: 'définir les cardinalités et relations de composition',
    benefit: 'respecter l association forte entre l ordre et ses composants',
    criteria: ['Relation 1-* entre Order et OrderItem', 'Composition forte Product vers CompositionItem']
  },
  'FA-16': {
    start: '03/10/2026', due: '04/10/2026', duedate: '2026-10-04',
    role: 'Chef de Projet Agile',
    action: 'structurer la planification du projet',
    benefit: 'organiser le travail par sprints et fixer les jalons',
    criteria: ['Découpage en 7 Epics cohérentes', 'Attribution des dates de réalisation prévisionnelles']
  },
  'FA-17': {
    start: '04/10/2026', due: '04/10/2026', duedate: '2026-10-04',
    role: 'Scrum Master',
    action: 'structurer le backlog Jira',
    benefit: 'assurer la traçabilité des fonctionnalités tout au long du cycle',
    criteria: ['Création des Epics et sous-tâches associées', 'Alignement avec le diagramme de classes']
  },
  'FA-18': {
    start: '04/10/2026', due: '04/10/2026', duedate: '2026-10-04',
    role: 'Chef de Projet',
    action: 'élaborer le planning prévisionnel et les jalons de livraison',
    benefit: 'respecter les délais impartis pour la livraison de l API',
    criteria: ['Jalons fixés pour chaque composant', 'Chronologie d exécution validée']
  },

  // EPIC 2
  'FA-19': {
    isEpic: true, start: '05/10/2026', due: '07/10/2026', duedate: '2026-10-07',
    obj: 'Mise en place de l environnement Docker, du serveur Express et de la base MongoDB en ReplicaSet pour les transactions ACID.',
    livrables: ['Dockerfile & compose.yaml', 'ReplicaSet MongoDB rs0', 'Architecture Express avec gestion des erreurs']
  },
  'FA-20': {
    start: '05/10/2026', due: '06/10/2026', duedate: '2026-10-06',
    role: 'Ingénieur DevOps',
    action: 'configurer l environnement Docker et Docker Compose',
    benefit: 'déployer l API et sa base de données de manière reproductible et isolée',
    criteria: ['Conteneur API avec Node.js 20 LTS', 'Conteneur MongoDB avec volume persistant']
  },
  'FA-21': {
    start: '05/10/2026', due: '06/10/2026', duedate: '2026-10-06',
    role: 'Ingénieur DevOps',
    action: 'rédiger le Dockerfile et le .dockerignore',
    benefit: 'optimiser le poids de l image et la rapidité du build',
    criteria: ['Exclusion de node_modules dans .dockerignore', 'Installation propre des dépendances de production']
  },
  'FA-22': {
    start: '06/10/2026', due: '06/10/2026', duedate: '2026-10-06',
    role: 'Ingénieur DevOps',
    action: 'configurer le fichier compose.yaml avec réseau dédié et volumes',
    benefit: 'assurer la communication transparente entre le conteneur API et MongoDB',
    criteria: ['Réseau interne factoryflow_network', 'Persistance des données dans un volume nommé']
  },
  'FA-23': {
    start: '06/10/2026', due: '07/10/2026', duedate: '2026-10-07',
    role: 'Administrateur Base de Données',
    action: 'initialiser un ReplicaSet rs0 sur MongoDB',
    benefit: 'rendre possible l utilisation des sessions et transactions ACID multi-documents',
    criteria: ['ReplicaSet rs0 activé au démarrage', 'Healthcheck MongoDB opérationnel']
  },
  'FA-24': {
    start: '06/10/2026', due: '07/10/2026', duedate: '2026-10-07',
    role: 'Développeur Backend',
    action: 'initialiser le serveur Express et l architecture en couches',
    benefit: 'disposer d une structure propre et modulaire pour le projet',
    criteria: ['Séparation routes / controllers / services / repositories', 'Point d entrée src/server.js']
  },
  'FA-25': {
    start: '07/10/2026', due: '07/10/2026', duedate: '2026-10-07',
    role: 'Développeur Backend',
    action: 'organiser les modules et repositories du projet',
    benefit: 'garantir une maintenance facilitée et le découplage des couches',
    criteria: ['Dossiers structurés selon les bonnes pratiques', 'Chargement modulaire des routes']
  },
  'FA-26': {
    start: '07/10/2026', due: '07/10/2026', duedate: '2026-10-07',
    role: 'Développeur Backend',
    action: 'gérer les variables d environnement de manière sécurisée',
    benefit: 'séparer la configuration du code source',
    criteria: ['Fichier .env.example documenté', 'Chargement sécurisé via dotenv']
  },
  'FA-27': {
    start: '07/10/2026', due: '07/10/2026', duedate: '2026-10-07',
    role: 'Développeur Backend',
    action: 'implémenter le middleware global de gestion des erreurs',
    benefit: 'capturer les erreurs de manière uniforme sans faire crasher l API',
    criteria: ['Classe AppError avec code HTTP', 'asyncHandler pour encapsuler les promesses']
  },

  // EPIC 3
  'FA-28': {
    isEpic: true, start: '08/10/2026', due: '10/10/2026', duedate: '2026-10-10',
    obj: 'Installation initiale unique, authentification JWT et contrôle des accès par rôles (RBAC).',
    livrables: ['Endpoint /installation', 'Authentification JWT /auth/login', 'Middlewares authenticate & authorise']
  },
  'FA-29': {
    start: '08/10/2026', due: '09/10/2026', duedate: '2026-10-09',
    role: 'Administrateur Système',
    action: 'vérifier si l application nécessite une installation initiale',
    benefit: 'bloquer l utilisation tant qu aucun compte administrateur n existe',
    criteria: ['GET /api/installation retourne { installed: false } si pas d admin', 'Retourne true une fois installé']
  },
  'FA-30': {
    start: '08/10/2026', due: '09/10/2026', duedate: '2026-10-09',
    role: 'Administrateur Système',
    action: 'créer le premier compte administrateur via l endpoint d installation',
    benefit: 'initialiser l accès au système de façon sécurisée',
    criteria: ['POST /api/installation crée l admin avec mot de passe haché (bcrypt)', 'Rejet strict 409 si réinstallation']
  },
  'FA-31': {
    start: '09/10/2026', due: '09/10/2026', duedate: '2026-10-09',
    role: 'Utilisateur de l Usine',
    action: 'me connecter à l API avec mes identifiants (email et mot de passe)',
    benefit: 'obtenir un jeton JWT pour effectuer mes opérations autorisées',
    criteria: ['POST /api/auth/login vérifie le mot de passe hashé', 'Génération d un token JWT signé valide 24h']
  },
  'FA-32': {
    start: '09/10/2026', due: '10/10/2026', duedate: '2026-10-10',
    role: 'Utilisateur Authentifié',
    action: 'consulter les informations de mon profil connecté',
    benefit: 'vérifier mon rôle et mes informations sans exposer mon mot de passe',
    criteria: ['GET /api/auth/profile retourne l utilisateur sans le mot de passe']
  },
  'FA-33': {
    start: '09/10/2026', due: '10/10/2026', duedate: '2026-10-10',
    role: 'Développeur Backend',
    action: 'protéger les routes privées avec les middlewares authenticate et authorise',
    benefit: 'interdire les accès anonymes et filtrer selon les permissions RBAC',
    criteria: ['authenticate vérifie la validité du Bearer Token', 'authorise refuse avec 403 si rôle insuffisant']
  },
  'FA-34': {
    start: '10/10/2026', due: '10/10/2026', duedate: '2026-10-10',
    role: 'Administrateur Usine',
    action: 'créer de nouveaux comptes utilisateurs (notamment des opérateurs)',
    benefit: 'permettre aux équipes d atelier d accéder à l outil de fabrication',
    criteria: ['POST /api/users réservé aux admins', 'Contrôle d unicité de l adresse email']
  },
  'FA-35': {
    start: '10/10/2026', due: '10/10/2026', duedate: '2026-10-10',
    role: 'Administrateur Usine',
    action: 'consulter la liste de tous les utilisateurs enregistrés',
    benefit: 'suivre les comptes actifs dans l usine',
    criteria: ['GET /api/users retourne la liste des comptes avec leur rôle']
  },

  // EPIC 4
  'FA-40': {
    isEpic: true, start: '11/10/2026', due: '13/10/2026', duedate: '2026-10-13',
    obj: 'Gestion des matières premières industrielles, suivi des stocks, seuils d alerte et traçabilité des mouvements.',
    livrables: ['CRUD Matières premières', 'Détection des stocks bas /alerts/low-stock', 'Historique des mouvements IN/OUT']
  },
  'FA-41': {
    start: '11/10/2026', due: '12/10/2026', duedate: '2026-10-12',
    role: 'Gestionnaire de Stock',
    action: 'gérer le catalogue des matières premières (acier, joints, visserie)',
    benefit: 'tenir à jour les références et unités de mesure utilisées en atelier',
    criteria: ['Modèle Material avec reference unique, nom, unité, stock disponible', 'Seuil d alerte obligatoire']
  },
  'FA-42': {
    start: '11/10/2026', due: '12/10/2026', duedate: '2026-10-12',
    role: 'Gestionnaire de Stock',
    action: 'enregistrer une nouvelle matière première dans le système',
    benefit: 'l intégrer dans les futures recettes de fabrication',
    criteria: ['POST /api/materials réservé aux admins', 'Rejet 409 si la référence existe déjà']
  },
  'FA-43': {
    start: '12/10/2026', due: '12/10/2026', duedate: '2026-10-12',
    role: 'Responsable des Approvisionnements',
    action: 'consulter en temps réel les matières premières en rupture ou stock bas',
    benefit: 'passer commande aux fournisseurs avant l arrêt des lignes de production',
    criteria: ['GET /api/materials/alerts/low-stock filtre sur availableQuantity <= alertThreshold']
  },
  'FA-44': {
    start: '12/10/2026', due: '13/10/2026', duedate: '2026-10-13',
    role: 'Opérateur / Gestionnaire',
    action: 'déclarer une entrée ou sortie manuelle de stock (approvisionnement, rebut)',
    benefit: 'ajuster l état réel du magasin et consigner le motif',
    criteria: ['Mouvement IN augmente le stock', 'Mouvement OUT diminue le stock avec interdiction de stock négatif']
  },
  'FA-45': {
    start: '13/10/2026', due: '13/10/2026', duedate: '2026-10-13',
    role: 'Auditeur Qualité',
    action: 'consulter l historique complet de tous les mouvements de stock',
    benefit: 'assurer la traçabilité complète de chaque gramme ou pièce consommée',
    criteria: ['GET /api/stock-movements avec populate de la matière et de l auteur']
  },

  // EPIC 5
  'FA-49': {
    isEpic: true, start: '14/10/2026', due: '16/10/2026', duedate: '2026-10-16',
    obj: 'Gestion des produits finis et de leurs nomenclatures de fabrication (BOM - Bill of Materials).',
    livrables: ['Modèle Product avec CompositionItem', 'Validation stricte de la recette', 'CRUD Produits et /bom']
  },
  'FA-50': {
    start: '14/10/2026', due: '15/10/2026', duedate: '2026-10-15',
    role: 'Ingénieur Méthodes',
    action: 'modéliser les produits finis avec leur nomenclature de fabrication',
    benefit: 'associer à chaque produit les matières et quantités unitaires indispensables',
    criteria: ['Sous-schéma CompositionItem (materialId, quantity > 0)', 'Référence produit unique']
  },
  'FA-51': {
    start: '14/10/2026', due: '15/10/2026', duedate: '2026-10-15',
    role: 'Ingénieur Méthodes',
    action: 'valider la cohérence des recettes lors de la création d un produit',
    benefit: 'empêcher l enregistrement de composants inexistants ou de doublons',
    criteria: ['Vérification de l existence réelle des matières', 'Interdiction formelle des doublons dans la recette']
  },
  'FA-52': {
    start: '15/10/2026', due: '16/10/2026', duedate: '2026-10-16',
    role: 'Responsable Usine',
    action: 'consulter et gérer le catalogue complet des produits fabriqués',
    benefit: 'disposer d une vue d ensemble des fabrications possibles',
    criteria: ['CRUD complet /api/products', 'Populate des composants dans les réponses GET']
  },
  'FA-53': {
    start: '15/10/2026', due: '16/10/2026', duedate: '2026-10-16',
    role: 'Ingénieur Méthodes',
    action: 'mettre à jour la nomenclature (BOM) d un produit existant',
    benefit: 'adapter les recettes lors d évolutions techniques des pièces',
    criteria: ['POST /api/products/:id/bom valide la nouvelle composition et remplace l ancienne']
  },

  // EPIC 6
  'FA-54': {
    isEpic: true, start: '16/10/2026', due: '18/10/2026', duedate: '2026-10-18',
    obj: 'Ordres de fabrication multi-produits avec conservation du snapshot figé et déduction atomique (ACID).',
    livrables: ['Modèle Order avec OrderItem et snapshot', 'Validation disponibilité multi-produits', 'Exécution atomique ACID']
  },
  'FA-55': {
    start: '16/10/2026', due: '17/10/2026', duedate: '2026-10-17',
    role: 'Responsable de Production',
    action: 'planifier des ordres de fabrication regroupant plusieurs produits différents',
    benefit: 'optimiser le lancement en atelier par série ou par commande client',
    criteria: ['Support d une liste d items avec quantités spécifiques', 'Recette figée dans l ordre']
  },
  'FA-56': {
    start: '16/10/2026', due: '17/10/2026', duedate: '2026-10-17',
    role: 'Développeur Backend',
    action: 'concevoir le modèle Mongoose Order avec OrderItem et OrderSnapshotItem',
    benefit: 'figer la formule exacte requise au moment de la création de l ordre',
    criteria: ['OrderItem avec productId et quantity', 'Snapshot avec materialId, reference, name, unit, quantityPerUnit']
  },
  'FA-57': {
    start: '17/10/2026', due: '17/10/2026', duedate: '2026-10-17',
    role: 'Responsable de Production',
    action: 'créer un ordre de fabrication multi-produits via l API',
    benefit: 'générer l ordre avec le statut initial PLANIFIE et les snapshots copiés',
    criteria: ['POST /api/orders réservé aux admins', 'Copie conforme de la recette BOM actuelle dans le snapshot']
  },
  'FA-58': {
    start: '17/10/2026', due: '18/10/2026', duedate: '2026-10-18',
    role: 'Responsable de Production',
    action: 'modifier ou annuler un ordre tant qu il est au statut PLANIFIE',
    benefit: 'ajuster le planning avant le démarrage effectif sans perturber le stock',
    criteria: ['Modification autorisée uniquement si PLANIFIE', 'Annulation avec passage au statut ANNULE']
  },
  'FA-59': {
    start: '17/10/2026', due: '18/10/2026', duedate: '2026-10-18',
    role: 'Responsable de Production',
    action: 'consulter et filtrer l ensemble des ordres de fabrication',
    benefit: 'suivre l avancement global de l usine par statut ou par opérateur',
    criteria: ['Filtre par statut (PLANIFIE, EN_COURS, TERMINE, ANNULE)', 'Filtre par opérateur assigné']
  },
  'FA-60': {
    start: '18/10/2026', due: '18/10/2026', duedate: '2026-10-18',
    role: 'Opérateur d Atelier',
    action: 'lancer un ordre de fabrication avec déduction atomique des stocks',
    benefit: 'consommer exactement les matières nécessaires sans risque d incohérence',
    criteria: ['Agrégation multi-produits', 'Validation disponibilité préalable', 'Transaction ACID']
  },
  'FA-61': {
    start: '18/10/2026', due: '18/10/2026', duedate: '2026-10-18',
    role: 'Système FactoryFlow',
    action: 'calculer les besoins totaux cumulés pour toutes les matières de l ordre',
    benefit: 'connaître précisément la quantité globale nécessaire pour tous les produits',
    criteria: ['Cumul exact des quantités si deux produits partagent la même matière première']
  },
  'FA-62': {
    start: '18/10/2026', due: '18/10/2026', duedate: '2026-10-18',
    role: 'Système FactoryFlow',
    action: 'vérifier la disponibilité du stock pour l ensemble des matières nécessaires',
    benefit: 'refuser le démarrage sans modifier aucun stock si une seule matière manque',
    criteria: ['Rejet avec HTTP 400 et message clair si stock insuffisant', 'Aucun débit de matière']
  },
  'FA-63': {
    start: '18/10/2026', due: '18/10/2026', duedate: '2026-10-18',
    role: 'Système FactoryFlow',
    action: 'déduire atomiquement les stocks et générer les mouvements OUT',
    benefit: 'garantir qu en cas d incident, tout est annulé ou tout est validé (ACID)',
    criteria: ['Utilisation de mongoose.startSession()', 'Mouvements OUT liés à l orderId', 'Passage à EN_COURS avec startedAt']
  },
  'FA-64': {
    start: '18/10/2026', due: '18/10/2026', duedate: '2026-10-18',
    role: 'Système FactoryFlow',
    action: 'rejeter formellement toute tentative de redémarrage d un ordre déjà en cours',
    benefit: 'éviter une double déduction de stock pour le même travail en cours',
    criteria: ['Vérification stricte que le statut est PLANIFIE', 'Erreur HTTP 400 immédiate sinon']
  },
  'FA-65': {
    start: '18/10/2026', due: '18/10/2026', duedate: '2026-10-18',
    role: 'Opérateur d Atelier',
    action: 'disposer d un espace personnel pour gérer mes ordres de travail',
    benefit: 'connaître mes tâches et clôturer mes fabrications terminées',
    criteria: ['Accès à mes ordres assignés', 'Clôture et horodatage fin']
  },
  'FA-66': {
    start: '18/10/2026', due: '18/10/2026', duedate: '2026-10-18',
    role: 'Opérateur d Atelier',
    action: 'consulter la liste de mes ordres de fabrication assignés',
    benefit: 'savoir quelles pièces fabriquer lors de ma journée de travail',
    criteria: ['GET /api/orders/my-orders filtre automatiquement sur l utilisateur connecté']
  },
  'FA-67': {
    start: '18/10/2026', due: '18/10/2026', duedate: '2026-10-18',
    role: 'Opérateur d Atelier',
    action: 'clôturer un ordre de fabrication une fois les pièces usinées et assemblées',
    benefit: 'marquer la fin du cycle et renseigner la date d achèvement réelle',
    criteria: ['POST/PATCH /api/orders/:id/finish', 'Statut devient TERMINE avec endedAt renseigné']
  },
  'FA-68': {
    start: '18/10/2026', due: '18/10/2026', duedate: '2026-10-18',
    role: 'Opérateur d Atelier',
    action: 'consulter l historique de mes ordres de fabrication terminés',
    benefit: 'justifier de mon activité de production en atelier',
    criteria: ['Filtrage possible sur le statut TERMINE']
  },

  // EPIC 7
  'FA-69': {
    isEpic: true, start: '18/10/2026', due: '19/10/2026', duedate: '2026-10-19',
    obj: 'Validation de la robustesse via tests unitaires Jest, documentation Swagger UI et guide README.',
    livrables: ['Tests Jest (Mocks repositories)', 'Documentation Swagger /api/docs', 'README.md et scripts seed']
  },
  'FA-70': {
    start: '18/10/2026', due: '19/10/2026', duedate: '2026-10-19',
    role: 'Ingénieur Qualité Logicielle',
    action: 'mettre en place les tests unitaires des services métier avec Jest',
    benefit: 'garantir la fiabilité des calculs sans dépendre d une base réelle',
    criteria: ['Mocks de tous les repositories', 'Tests des scénarios nominaux et d erreur']
  },
  'FA-71': {
    start: '18/10/2026', due: '19/10/2026', duedate: '2026-10-19',
    role: 'Développeur Backend',
    action: 'configurer Jest et créer les mocks de repositories',
    benefit: 'isoler les tests unitaires et exécuter la suite en quelques secondes',
    criteria: ['Fichier jest.config.js configuré', 'Mocks de orderRepository, materialRepository, etc.']
  },
  'FA-72': {
    start: '18/10/2026', due: '19/10/2026', duedate: '2026-10-19',
    role: 'Développeur Backend',
    action: 'tester unitairement le calcul des besoins et le rejet de stock insuffisant',
    benefit: 'prouver mathématiquement le respect des formules de calcul',
    criteria: ['Test avec 2 produits partageant la même matière', 'Rejet avec 400 si quantité insuffisante']
  },
  'FA-73': {
    start: '19/10/2026', due: '19/10/2026', duedate: '2026-10-19',
    role: 'Développeur Backend',
    action: 'tester unitairement le démarrage réussi et l interdiction du second démarrage',
    benefit: 'valider la transaction simulée et la protection contre les doublons',
    criteria: ['Vérification de startTransaction et commitTransaction', 'Rejet 400 si déjà EN_COURS']
  },
  'FA-74': {
    start: '19/10/2026', due: '19/10/2026', duedate: '2026-10-19',
    role: 'Développeur Backend',
    action: 'tester unitairement l installation unique et le rejet de réinstallation',
    benefit: 'sécuriser le point d entrée d initialisation du système',
    criteria: ['Succès si aucun admin', 'Rejet 409 si un admin existe déjà']
  },
  'FA-75': {
    start: '19/10/2026', due: '19/10/2026', duedate: '2026-10-19',
    role: 'Ingénieur Documentation',
    action: 'rédiger la documentation complète de l API et les guides d utilisation',
    benefit: 'permettre aux évaluateurs et développeurs de tester facilement la solution',
    criteria: ['Interface Swagger interactive', 'README détaillé avec commandes Docker']
  },
  'FA-76': {
    start: '19/10/2026', due: '19/10/2026', duedate: '2026-10-19',
    role: 'Ingénieur Documentation',
    action: 'spécifier l ensemble des endpoints dans un fichier OpenAPI 3.0',
    benefit: 'fournir une documentation visuelle interactive via Swagger UI',
    criteria: ['Fichier swagger.yaml exhaustif', 'Accessible sur http://localhost:5001/api/docs']
  },
  'FA-77': {
    start: '19/10/2026', due: '19/10/2026', duedate: '2026-10-19',
    role: 'Chef de Projet',
    action: 'rédiger le fichier README.md du dépôt GitHub',
    benefit: 'présenter le projet, l architecture, les consignes et les tests',
    criteria: ['Présentation de l usine de Safi', 'Tableau complet des routes et rôles']
  },
  'FA-78': {
    start: '19/10/2026', due: '19/10/2026', duedate: '2026-10-19',
    role: 'Développeur Backend',
    action: 'préparer un jeu de données de test complet via un script de seed',
    benefit: 'faire une démonstration fonctionnelle en soutenance en une commande',
    criteria: ['Script scripts/seed.js autonome', 'Création d un jeu cohérent de matières, produits et ordres']
  }
};

async function main() {
  console.log('🚀 Début de la mise à jour des tickets Jira en User Stories avec dates échelonnées...\n');

  const keys = Object.keys(STORIES);
  console.log(`Nombre de tickets à mettre à jour : ${keys.length}\n`);

  let successCount = 0;

  for (const key of keys) {
    const item = STORIES[key];
    try {
      let adfDoc;
      if (item.isEpic) {
        adfDoc = makeEpicAdf(item.start, item.due, item.obj, item.livrables);
      } else {
        adfDoc = makeUserStoryAdf(item.start, item.due, item.role, item.action, item.benefit, item.criteria);
      }

      const updatePayload = {
        fields: {
          description: adfDoc
        }
      };

      if (item.duedate) {
        updatePayload.fields.duedate = item.duedate;
      }

      await callJira(`/rest/api/3/issue/${key}`, 'PUT', updatePayload);
      console.log(`✅ [${key}] Mis à jour : Période ${item.start} -> ${item.due} | Format User Story appliqué`);
      successCount++;

      // Petit délai pour respecter le rate limiting Jira
      await new Promise(r => setTimeout(r, 120));
    } catch (err) {
      console.error(`⚠️ Erreur sur ${key} :`, err.message);
    }
  }

  console.log(`\n🎉 TERMINÉ ! ${successCount} / ${keys.length} tickets Jira ont été mis à jour avec succès !`);
  console.log('Toutes les sous-tâches sont désormais écrites au format "En tant que... Je souhaite... Afin de..." avec des dates échelonnées étalées sur tout le mois d octobre 2026.\n');
}

main().catch(console.error);
