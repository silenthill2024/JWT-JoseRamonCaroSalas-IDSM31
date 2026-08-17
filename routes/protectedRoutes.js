const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const perfilController = require("../controllers/perfilController");

// Ruta protegida
router.get("/perfil", authMiddleware, perfilController.getProfile);

module.exports = router;