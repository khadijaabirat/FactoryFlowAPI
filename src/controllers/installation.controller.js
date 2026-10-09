const InstallationService = require('../services/installation.service');
const asyncHandler = require('../utils/asyncHandler');

const getStatus = asyncHandler(async (req, res) => {
  const isInstalled = await InstallationService.getInstalationStatut();

  return res.status(200).json({
    success: true,
    installed: isInstalled
  });
});

const instalationApplication = asyncHandler(async (req, res) => {
  const admin = await InstallationService.instalationApplication(req.body);

  return res.status(201).json({
    success: true,
    message: "L'application est installée avec succès.",
    data: admin
  });
});

module.exports = {
  getStatus,
  installApplication: instalationApplication,
  instalationApplication
};