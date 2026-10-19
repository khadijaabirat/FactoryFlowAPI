const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Material = require('../src/models/Material');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const StockMovement = require('../src/models/StockMovement');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/factoryflow?directConnection=true';

async function seed() {
  try {
    console.log('Connexion a MongoDB...');
    await mongoose.connect(MONGO_URI);

    console.log('Nettoyage de la base...');
    await User.deleteMany({});
    await Material.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await StockMovement.deleteMany({});

    console.log('Creation des utilisateurs...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'ADMIN'
    });

    const operator = await User.create({
      name: 'Operateur',
      email: 'operateur@gmail.com',
      password: hashedPassword,
      role: 'OPERATOR'
    });

    console.log('Creation des matieres premieres...');
    const matInox = await Material.create({
      reference: 'MP-INOX-316',
      name: 'Acier Inoxydable 316L',
      unit: 'kg',
      availableQuantity: 500,
      alertThreshold: 50
    });

    const matJoint = await Material.create({
      reference: 'MP-JOINT-50',
      name: 'Joint Torique 50mm',
      unit: 'pièce',
      availableQuantity: 200,
      alertThreshold: 30
    });

    const matVis = await Material.create({
      reference: 'MP-VIS-M12',
      name: 'Boulon M12',
      unit: 'pièce',
      availableQuantity: 800,
      alertThreshold: 100
    });

    console.log('Creation des produits et recettes...');
    const prodVanne = await Product.create({
      reference: 'PROD-VANN-50',
      name: 'Vanne 50mm Inox',
      composition: [
        { materialId: matInox._id, quantity: 4.5 },
        { materialId: matJoint._id, quantity: 2 },
        { materialId: matVis._id, quantity: 8 }
      ]
    });

    const prodClapet = await Product.create({
      reference: 'PROD-CLAP-30',
      name: 'Clapet 30mm',
      composition: [
        { materialId: matInox._id, quantity: 2.0 },
        { materialId: matJoint._id, quantity: 1 },
        { materialId: matVis._id, quantity: 4 }
      ]
    });

    console.log('Creation d un ordre de test...');
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

    console.log('Creation des mouvements de stock initiaux...');
    await StockMovement.create([
      {
        materialId: matInox._id,
        type: 'IN',
        quantity: 500,
        reason: 'Stock initial',
        performedBy: admin._id
      },
      {
        materialId: matJoint._id,
        type: 'IN',
        quantity: 200,
        reason: 'Stock initial',
        performedBy: admin._id
      },
      {
        materialId: matVis._id,
        type: 'IN',
        quantity: 800,
        reason: 'Stock initial',
        performedBy: admin._id
      }
    ]);

    console.log('Base de donnees initialisee avec succes !');
    console.log('Admin: admin@gmail.com / password123');
    console.log('Operateur: operateur@gmail.com / password123');
    console.log('Ordre cree ID:', order._id);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Erreur seed:', err);
    process.exit(1);
  }
}

seed();
