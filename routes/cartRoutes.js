const express = require('express');

const router = express.Router();

const authMiddleware =
    require('../middleware/authMiddleware');

const cartController =
    require('../controllers/cartController');


// Obtener carrito

router.get(
    '/',
    authMiddleware,
    cartController.obtenerCarrito
);


// Agregar producto

router.post(
    '/add',
    authMiddleware,
    cartController.agregarProducto
);


// Actualizar cantidad

router.put(
    '/update/:productId',
    authMiddleware,
    cartController.actualizarCantidad
);


// Eliminar producto

router.delete(
    '/remove/:productId',
    authMiddleware,
    cartController.eliminarProducto
);


// Vaciar carrito

router.delete(
    '/clear',
    authMiddleware,
    cartController.vaciarCarrito
);


module.exports = router;