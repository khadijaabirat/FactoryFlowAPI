/**
 * Script d'alignement complet du Backlog Jira avec le nouveau Diagramme de Classes
 * (Gestion Multi-produits par Ordre, OrderItem, OrderSnapshotItem, Material, StockMovement IN/OUT)
 */

const https = require('https');

const EMAIL = 'abiratkhadija@gmail.com';
const TOKEN = 'ATATT3xFfGF00pnk6pGwND_OAlI8DajQhQKylYUgIMSXgCvHGXhmFazYmNKEXEYXIzg8nVEkTNhqIDl_VdcD5iHQbka-zsXtX2Tr1JC5y-6_v4UB8hTzcqayCJKrGAUgfVwhicn4g4AuvlHtV6RyiLSbgJMqUiD0uo_tZI3GL07mGqHD01Zn5jY=E38E7457';
const JIRA_DOMAIN = 'abiratkhadija-1788780331877.atlassian.net';
const AUTH = Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64');

function callJira(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: JIRA_DOMAIN,
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch {
            resolve(body);
          }
        } else {
          reject(new Error(`Jira Error [${res.statusCode}]: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function updateIssue(key, summary, description = null) {
  const fields = { summary };
  if (description) {
    fields.description = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: description }]
        }
      ]
    };
  }
  return await callJira(`/rest/api/3/issue/${key}`, 'PUT', { fields });
}

async function transitionIssue(key, transitionId) {
  return await callJira(`/rest/api/3/issue/${key}/transitions`, 'POST', {
    transition: { id: transitionId }
  });
}

// Liste des mises à jour pour alignement 100% avec le diagramme
const updates = [
  // --- EPIC 4 : Matières & Mouvements ---
  {
    key: 'FA-40',
    summary: 'EPIC 4: Gestion des Matières Premières (Material) & Mouvements de Stock',
    description: 'Gestion des matières premières (Material) et traçabilité des mouvements de stock (StockMovement avec type IN et OUT, lien orderId et performedBy).'
  },
  {
    key: 'FA-41',
    summary: 'CRUD Matières Premières (Material) et Alertes Stock Faible',
    description: 'Gestion du référentiel des matières premières (Material : reference, availableQuantity, alertThreshold, unit) et alertes stock critique.'
  },
  {
    key: 'FA-42',
    summary: 'Modèle & Repository Material (reference, availableQuantity, alertThreshold, unit)',
    description: 'Modèle Mongoose Material avec contrainte unique sur reference, availableQuantity (min: 0), alertThreshold (min: 0) et repository avec méthode findLowStock().'
  },
  {
    key: 'FA-43',
    summary: 'Endpoints CRUD des matières premières /api/materials (Admin/Opérateur)',
    description: 'Contrôleur et routes Express pour les opérations CRUD sur /api/materials protégés par RBAC (Admin pour écriture, Opérateur pour lecture).'
  },
  {
    key: 'FA-44',
    summary: 'Endpoint GET /api/materials/alerts/low-stock (alertes stock <= alertThreshold)',
    description: 'Détection en temps réel des matières premières dont availableQuantity est inférieure ou égale au seuil alertThreshold.'
  },
  {
    key: 'FA-45',
    summary: 'Traçabilité & Mouvements de Stock (StockMovement IN / OUT)',
    description: 'Enregistrement et consultation des mouvements de stock avec type IN/OUT, motif, lien ordre de fabrication et opérateur responsable (performedBy).'
  },
  {
    key: 'FA-46',
    summary: 'Modèle & Repository StockMovement (type IN/OUT, materialId, performedBy, reason, orderId)',
    description: 'Schéma Mongoose StockMovement avec enum MovementType [IN, OUT], liaisons avec Material, User et ManufacturingOrder.'
  },
  {
    key: 'FA-47',
    summary: 'Endpoint POST /api/stock-movements avec mise à jour du stock (availableQuantity)',
    description: 'Enregistrement d\'un mouvement manuel (IN pour entrée fournisseur, OUT pour sortie/perte) et incrément/décrément automatique du stock de la matière.'
  },
  {
    key: 'FA-48',
    summary: 'Endpoint GET /api/stock-movements pour l\'historique d\'audit et traçabilité',
    description: 'Consultation paginée de l\'historique des mouvements de stock avec populate des détails de la matière et de l\'utilisateur.'
  },

  // --- EPIC 5 : Produits & BOM ---
  {
    key: 'FA-49',
    summary: 'EPIC 5: Produits Finis & Nomenclatures de Composition (BOM)',
    description: 'Gestion du catalogue des produits finis (Product : reference, name) et de leur recette de fabrication (CompositionItem : materialId, quantity).'
  },
  {
    key: 'FA-50',
    summary: 'Gestion du Catalogue des Produits et Nomenclatures (BOM)',
    description: 'Définition des produits fabriqués par l\'usine et composition unitaire en matières premières.'
  },
  {
    key: 'FA-51',
    summary: 'Modèle & Repository Product avec CompositionItem (reference, name, items: materialId, quantity)',
    description: 'Modèle Mongoose Product avec référence unique, nom et sous-documents CompositionItem reliant chaque composant avec sa quantité requise.'
  },
  {
    key: 'FA-52',
    summary: 'Validation métier de la composition BOM (matières existantes, unicité, quantité > 0)',
    description: 'Vérification de la validité de la nomenclature : existence de chaque matière première, absence de doublons et quantités strictement positives.'
  },
  {
    key: 'FA-53',
    summary: 'Endpoints CRUD des produits et gestion de la nomenclature BOM (Admin)',
    description: 'API REST complète pour créer, lister, consulter, modifier et supprimer des produits avec leur composition unitaire.'
  },

  // --- EPIC 6 : Ordres de Fabrication Multi-Produits (Consigne du Prof !) ---
  {
    key: 'FA-54',
    summary: 'EPIC 6: Ordres de Fabrication Multi-Produits & Exécution Atomique',
    description: 'Gestion des ordres de fabrication multi-produits (un ordre contient plusieurs OrderItem), figeant la recette dans OrderSnapshotItem, avec workflow PLANIFIE -> EN_COURS -> TERMINE et déduction atomique du stock.'
  },
  {
    key: 'FA-55',
    summary: 'Création et Gestion des Ordres Multi-Produits (OrderItem & OrderSnapshotItem)',
    description: 'Gestion des ordres permettant de fabriquer plusieurs produits dans le même ordre de fabrication avec snapshot figé des nomenclatures.'
  },
  {
    key: 'FA-56',
    summary: 'Modèle ManufacturingOrder avec OrderItem (multi-produits) et OrderSnapshotItem (recette figée)',
    description: 'Modèle Mongoose supportant plusieurs produits par ordre (relation 1 à * avec OrderItem : productId, quantity) et conservant un snapshot des matières premières requises (OrderSnapshotItem : materialId, reference, name, unit, quantityPerUnit) avec statuts : PLANIFIE, EN_COURS, TERMINE, ANNULE.'
  },
  {
    key: 'FA-57',
    summary: 'Endpoint POST /api/manufacturing-orders : création d\'ordre multi-produits et copie figée du snapshot',
    description: 'Création d\'un ordre multi-produits à l\'état PLANIFIE, affecté à un opérateur (assignedTo), en capturant instantanément la composition actuelle de chaque produit commandé.'
  },
  {
    key: 'FA-58',
    summary: 'Modification et annulation d\'ordre (autorisé uniquement si statut PLANIFIE)',
    description: 'Possibilité pour l\'Admin d\'annuler (statut ANNULE) ou modifier les quantités tant que l\'ordre n\'est pas encore démarré.'
  },
  {
    key: 'FA-59',
    summary: 'Consultation globale des ordres avec filtres (statuts PLANIFIE/EN_COURS/TERMINE/ANNULE, période)',
    description: 'Listing des ordres avec pagination, filtres par statut et détails des OrderItem commandés.'
  },
  {
    key: 'FA-60',
    summary: 'Démarrage d\'Ordre & Déduction Atomique Multi-Produits (Transactions ACID)',
    description: 'Workflow de lancement d\'un ordre multi-produits avec vérification de disponibilité globale et déduction atomique du stock.'
  },
  {
    key: 'FA-61',
    summary: 'Calcul global des besoins en matières pour tous les OrderItem de l\'ordre',
    description: 'Algorithme agrégeant les besoins cumulés de toutes les matières pour l\'ensemble des produits commandés dans l\'ordre (somme de quantité x quantityPerUnit).'
  },
  {
    key: 'FA-62',
    summary: 'Vérification des disponibilités pour tous les produits et refus si stock insuffisant',
    description: 'Contrôle strict : si une seule matière première est insuffisante pour l\'ensemble de l\'ordre, le démarrage est refusé sans déduire aucun stock (état PLANIFIE conservé).'
  },
  {
    key: 'FA-63',
    summary: 'Déduction atomique du stock par transaction ACID, génération des mouvements OUT et passage à EN_COURS',
    description: 'Exécution d\'une transaction MongoDB (session/ACID) : déduction des stocks de toutes les matières requises, création des StockMovement OUT rattachés à l\'ordre (orderId), passage au statut EN_COURS et enregistrement de startedAt.'
  },
  {
    key: 'FA-64',
    summary: 'Rejet strict de tout second démarrage pour un ordre déjà lancé',
    description: 'Garantie d\'idempotence : interdiction absolue de relancer un ordre déjà EN_COURS ou TERMINE pour éviter toute double déduction.'
  },
  {
    key: 'FA-67',
    summary: 'Endpoint PATCH /orders/:id/finish : passage au statut TERMINE et horodatage endedAt',
    description: 'Clôture de la production par l\'opérateur affecté, passage au statut TERMINE et enregistrement de la date endedAt.'
  },
  {
    key: 'FA-72',
    summary: 'Tests unitaires Jest : calcul des besoins multi-produits et rejet stock insuffisant',
    description: 'Tests unitaires automatisés validant le calcul des besoins pour ordres multi-produits et le refus en cas de stock critique.'
  }
];

async function main() {
  console.log('🚀 Démarrage de l\'alignement du projet Jira avec le nouveau Diagramme de Classes...\n');

  for (const item of updates) {
    try {
      await updateIssue(item.key, item.summary, item.description);
      console.log(`✅ [${item.key}] Mis à jour : ${item.summary}`);
    } catch (err) {
      console.error(`❌ Erreur sur ${item.key}:`, err.message);
    }
  }

  console.log('\n--- Mise à jour des statuts actuels du projet ---');
  // Transitionner FA-42, FA-43, FA-44 et FA-41 vers Terminé (id 31)
  const doneTasks = ['FA-42', 'FA-43', 'FA-44', 'FA-41'];
  for (const k of doneTasks) {
    try {
      await transitionIssue(k, '31');
      console.log(`🎉 ${k} passé à "Terminé" !`);
    } catch (err) {
      console.log(`ℹ️ ${k} statut : ${err.message}`);
    }
  }

  // Transitionner FA-45 et FA-46 vers En cours (id 21)
  const inProgressTasks = ['FA-45', 'FA-46'];
  for (const k of inProgressTasks) {
    try {
      await transitionIssue(k, '21');
      console.log(`⚡ ${k} passé à "En cours" !`);
    } catch (err) {
      console.log(`ℹ️ ${k} statut : ${err.message}`);
    }
  }

  console.log('\n✨ Backlog Jira 100% ALIGNÉ avec le Diagramme de Classes ! 🎉\n');
}

main().catch(console.error);
