const express = require('express');
const router = express.Router();

// Route racine de l'API
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bienvenue sur l\'API FactoryFlow',
    version: '1.0.0'
  });
});

module.exports = router;
