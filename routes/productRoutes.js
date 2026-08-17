const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

let productos = [
    { id: 1, nombre: "Laptop", precio: 1500 },
    { id: 2, nombre: "Mouse", precio: 50 },
    { id: 3, nombre: "Teclado", precio: 90 },
    { id: 4, nombre: "Monitor", precio: 350 }
];

// Endpoint público
router.get("/productos", (req, res) => {

    res.json({
        success: true,
        count: productos.length,
        data: productos
    });

});

// Endpoint protegido
router.post("/productos", authMiddleware, (req, res) => {

    const nuevo = {
        id: productos.length + 1,
        nombre: req.body.nombre,
        precio: req.body.precio
    };

    productos.push(nuevo);

    res.status(201).json({
        success: true,
        message: "Producto creado exitosamente",
        data: nuevo
    });

});

module.exports = router;