const express = require('express');

const router = express.Router();

const authMiddleware =
    require('../middleware/authMiddleware');

const cartController =
    require('../controllers/cartController');


// ==========================================
// OBTENER CARRITO
// GET /api/carrito
// ==========================================

router.get(
    '/',
    authMiddleware,
    cartController.obtenerCarrito
);


// ==========================================
// AGREGAR PRODUCTO
// POST /api/carrito/add
// ==========================================

router.post(
    '/add',
    authMiddleware,
    (req, res, next) => {
        console.log('>>> POST /api/carrito/add DETECTADO');
        console.log('Authorization:', req.headers.authorization);
        console.log('Body:', req.body);
        next();
    },
    cartController.agregarProducto
);


// ==========================================
// ACTUALIZAR CANTIDAD
// PUT /api/carrito/update/:productId
// ==========================================

router.put(
    '/update/:productId',
    authMiddleware,
    cartController.actualizarCantidad
);


// ==========================================
// ELIMINAR PRODUCTO
// DELETE /api/carrito/remove/:productId
// ==========================================

router.delete(
    '/remove/:productId',
    authMiddleware,
    cartController.eliminarProducto
);


// ==========================================
// VACIAR CARRITO
// DELETE /api/carrito/clear
// ==========================================

router.delete(
    '/clear',
    authMiddleware,
    cartController.vaciarCarrito
);


module.exports = router;

module.exports = router;