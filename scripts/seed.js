/**
 * Script de chargement de données de démonstration (Seed)
 * Usage: node scripts/seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Material = require('../src/models/Material');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const StockMovement = require('../src/models/StockMovement');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/factoryflow?directConnection=true';

async function seed() {
  console.log('🌱 Connexion à MongoDB pour initialiser les données de démonstration...');
  await mongoose.connect(MONGO_URI);

  console.log('🧹 Nettoyage des collections existantes...');
  await User.deleteMany({});
  await Material.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await StockMovement.deleteMany({});

  console.log('👤 Création des utilisateurs...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await User.create({
    name: 'Admin Usine Safi',
    email: 'admin@factoryflow.com',
    password: passwordHash,
    role: 'ADMIN'
  });

  const operator = await User.create({
    name: 'Rachid El Amrani (Opérateur)',
    email: 'rachid@factoryflow.com',
    password: passwordHash,
    role: 'OPERATOR'
  });

  console.log('🧱 Création des matières premières...');
  const matInox = await Material.create({
    reference: 'MP-INOX-316',
    name: 'Tôle Acier Inoxydable 316L',
    unit: 'kg',
    availableQuantity: 500,
    alertThreshold: 50
  });

  const matJoint = await Material.create({
    reference: 'MP-JOINT-50',
    name: 'Joint d Étanchéité Haute Pression 50mm',
    unit: 'pièce',
    availableQuantity: 200,
    alertThreshold: 30
  });

  const matVis = await Material.create({
    reference: 'MP-VIS-M12',
    name: 'Boulonnerie Inox M12x40',
    unit: 'pièce',
    availableQuantity: 800,
    alertThreshold: 100
  });

  console.log('⚙️ Création des produits finis avec nomenclature BOM...');
  const prodVanne = await Product.create({
    reference: 'PROD-VANN-50',
    name: 'Vanne Industrielle 50mm Haute Résistance',
    composition: [
      { materialId: matInox._id, quantity: 4.5 },
      { materialId: matJoint._id, quantity: 2 },
      { materialId: matVis._id, quantity: 8 }
    ]
  });

  const prodClapet = await Product.create({
    reference: 'PROD-CLAP-30',
    name: 'Clapet Anti-Retour 30mm',
    composition: [
      { materialId: matInox._id, quantity: 2.0 },
      { materialId: matJoint._id, quantity: 1 },
      { materialId: matVis._id, quantity: 4 }
    ]
  });

  console.log('📋 Création d un ordre de fabrication multi-produits...');
  const order = await Order.create({
    assignedTo: operator._id,
    status: 'PLANIFIE',
    items: [
      {
        productId: prodVanne._id,
        quantity: 10,
        snapshot: [
          { materialId: matInox._id, reference: matInox.reference, name: matInox.name, unit: matInox.unit, quantityPerUnit: 4.5 },
          { materialId: matJoint._id, reference: matJoint.reference, name: matJoint.name, unit: matJoint.unit, quantityPerUnit: 2 },
          { materialId: matVis._id, reference: matVis.reference, name: matVis.name, unit: matVis.unit, quantityPerUnit: 8 }
        ]
      },
      {
        productId: prodClapet._id,
        quantity: 15,
        snapshot: [
          { materialId: matInox._id, reference: matInox.reference, name: matInox.name, unit: matInox.unit, quantityPerUnit: 2.0 },
          { materialId: matJoint._id, reference: matJoint.reference, name: matJoint.name, unit: matJoint.unit, quantityPerUnit: 1 },
          { materialId: matVis._id, reference: matVis.reference, name: matVis.name, unit: matVis.unit, quantityPerUnit: 4 }
        ]
      }
    ]
  });

  console.log('📊 Enregistrement des mouvements de stock initiaux...');
  await StockMovement.create([
    {
      materialId: matInox._id,
      type: 'IN',
      quantity: 500,
      reason: 'Approvisionnement initial usine',
      performedBy: admin._id
    },
    {
      materialId: matJoint._id,
      type: 'IN',
      quantity: 200,
      reason: 'Approvisionnement initial usine',
      performedBy: admin._id
    },
    {
      materialId: matVis._id,
      type: 'IN',
      quantity: 800,
      reason: 'Approvisionnement initial usine',
      performedBy: admin._id
    }
  ]);

  console.log('\n✅ Données de démonstration chargées avec succès !');
  console.log('----------------------------------------------------');
  console.log('👤 Administrateur : admin@factoryflow.com / Password123!');
  console.log('👷 Opérateur      : rachid@factoryflow.com / Password123!');
  console.log('📦 Produits       : PROD-VANN-50, PROD-CLAP-30');
  console.log('📋 Ordre de démo  : ID ' + order._id + ' (PLANIFIE)');
  console.log('----------------------------------------------------\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Erreur lors du seed :', err);
  process.exit(1);
});
