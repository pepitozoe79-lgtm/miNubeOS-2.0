const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const dockerService = require('../services/dockerService');
const appStoreService = require('../services/appStoreService');
const composeService = require('../services/composeService');

// List installed apps (containers)
router.get('/installed', authMiddleware, async (req, res) => {
  try {
    const containers = await dockerService.getContainers();
    res.json(containers);
  } catch (error) {
    res.status(500).json({ error: 'Error al conectar con Docker' });
  }
});

// List Categories
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const categories = await appStoreService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// List available apps (Store) with Search and Categories
router.get('/store', authMiddleware, async (req, res) => {
  try {
    const { category, search } = req.query;
    const apps = await appStoreService.getApps(category, search);
    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener aplicaciones del catálogo' });
  }
});

// Install App (CasaOS / Compose support)
router.post('/install/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const appId = req.params.id;
    console.log(`Instalando app: ${appId}`);
    
    // 1. Fetch the Compose YAML from CasaOS Store
    const composeData = await appStoreService.getAppDetails(appId);
    
    // 2. Deploy using Compose Service
    await composeService.deployApp(appId, composeData);
    
    res.json({ message: `Aplicación ${appId} instalada correctamente mediante Docker Compose.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start App (Handle legacy or Compose)
router.post('/:id/start', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Attempt compose start first
    try {
        await composeService.deployApp(req.params.id); // 'up' again
    } catch (e) {
        await dockerService.startContainer(req.params.id);
    }
    res.json({ message: 'App iniciada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop App
router.post('/:id/stop', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    try {
        await composeService.stopApp(req.params.id);
    } catch (e) {
        await dockerService.stopContainer(req.params.id);
    }
    res.json({ message: 'App detenida' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
