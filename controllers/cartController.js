const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper para extraer el ID de usuario de forma segura
const getUserId = (req) => {
    return req.user ? (req.user._id || req.user.id) : null;
};

// ==========================================
// OBTENER CARRITO
// GET /api/carrito
// ==========================================
exports.obtenerCarrito = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        // Busca por userId o usuario según la definición de tu Schema
        let carrito = await Cart.findOne({
            $or: [{ userId: userId }, { usuario: userId }]
        });

        if (!carrito) {
            carrito = await Cart.create({
                userId: userId,
                usuario: userId,
                items: [],
                total: 0
            });
        }

        return res.status(200).json(carrito);

    } catch (error) {
        console.error('ERROR OBTENIENDO CARRITO:', error);
        return res.status(500).json({ error: 'Error al obtener carrito' });
    }
};

// ==========================================
// AGREGAR PRODUCTO
// POST /api/carrito/add
// ==========================================
exports.agregarProducto = async (req, res) => {
    try {

        // ==========================================
        // DIAGNÓSTICO
        // ==========================================

        console.log('==========================================');
        console.log('>>> AGREGAR PRODUCTO CONTROLLER');
        console.log('req.user:', req.user);
        console.log('req.body:', req.body);

        // ==========================================
        // OBTENER DATOS
        // ==========================================

        const userId = getUserId(req);
        const { productId, cantidad } = req.body;

        console.log('>>> userId:', userId);
        console.log('>>> productId:', productId);
        console.log('>>> cantidad:', cantidad);

        // ==========================================
        // VALIDAR USUARIO
        // ==========================================

        if (!userId) {
            console.log('>>> ERROR: Usuario no autenticado');

            return res.status(401).json({
                error: 'Usuario no autenticado'
            });
        }

        // ==========================================
        // VALIDAR PRODUCT ID
        // ==========================================

        if (!productId) {
            console.log('>>> ERROR: productId no proporcionado');

            return res.status(400).json({
                error: 'productId es obligatorio'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.log('>>> ERROR: productId inválido:', productId);

            return res.status(400).json({
                error: 'El productId no es un ObjectId válido'
            });
        }

        console.log('>>> productId válido');

        // ==========================================
        // VALIDAR CANTIDAD
        // ==========================================

        const cantidadAgregar = Number(cantidad);

        console.log(
            '>>> cantidad convertida:',
            cantidadAgregar
        );

        if (
            isNaN(cantidadAgregar) ||
            !Number.isInteger(cantidadAgregar) ||
            cantidadAgregar <= 0
        ) {
            console.log('>>> ERROR: cantidad inválida');

            return res.status(400).json({
                error: 'La cantidad debe ser un entero mayor a 0'
            });
        }

        // ==========================================
        // BUSCAR PRODUCTO
        // ==========================================

        console.log(
            '>>> Buscando producto:',
            productId
        );

        const producto =
            await Product.findById(productId);

        console.log(
            '>>> Resultado producto:',
            producto
        );

        if (!producto) {

            console.log(
                '>>> ERROR: Producto no encontrado'
            );

            return res.status(404).json({
                error: 'Producto no encontrado en el catálogo'
            });
        }

        console.log(
            '>>> Producto encontrado:',
            producto.nombre
        );

        console.log(
            '>>> Precio:',
            producto.precio
        );

        console.log(
            '>>> Stock:',
            producto.stock
        );

        // ==========================================
        // VALIDAR STOCK
        // ==========================================

        if (
            Number(producto.stock) <
            cantidadAgregar
        ) {

            console.log(
                '>>> ERROR: Stock insuficiente'
            );

            return res.status(409).json({
                error: 'Producto sin stock suficiente'
            });
        }

        console.log('>>> Stock suficiente');

        // ==========================================
        // BUSCAR CARRITO DEL USUARIO
        // ==========================================

        console.log(
            '>>> Buscando carrito del usuario:',
            userId
        );

        let carrito =
            await Cart.findOne({
                $or: [
                    { userId: userId },
                    { usuario: userId }
                ]
            });

        console.log(
            '>>> Carrito encontrado:',
            carrito
        );

        // ==========================================
        // CREAR CARRITO SI NO EXISTE
        // ==========================================

        if (!carrito) {

            console.log(
                '>>> No existe carrito. Creando uno nuevo...'
            );

            carrito = new Cart({
                userId: userId,
                usuario: userId,
                items: [],
                total: 0
            });
        }

        // ==========================================
        // BUSCAR SI EL PRODUCTO YA ESTÁ
        // ==========================================

        const itemExistente =
            carrito.items.find(
                item =>
                    item.productId.toString() ===
                    productId.toString()
            );

        console.log(
            '>>> Item existente:',
            itemExistente
        );

        // ==========================================
        // PRODUCTO YA EXISTE
        // ==========================================

        if (itemExistente) {

            console.log(
                '>>> El producto ya existe en el carrito'
            );

            const nuevaCantidad =
                Number(itemExistente.cantidad) +
                cantidadAgregar;

            console.log(
                '>>> Nueva cantidad:',
                nuevaCantidad
            );

            if (
                nuevaCantidad >
                Number(producto.stock)
            ) {

                console.log(
                    '>>> ERROR: Nueva cantidad supera stock'
                );

                return res.status(409).json({
                    error:
                        'No hay suficiente stock para agregar esa cantidad'
                });
            }

            itemExistente.cantidad =
                nuevaCantidad;

        } else {

            // ==========================================
            // AGREGAR PRODUCTO NUEVO
            // ==========================================

            console.log(
                '>>> Agregando producto nuevo al carrito'
            );

            carrito.items.push({
                productId: producto._id,
                nombre: producto.nombre,
                precio: Number(producto.precio),
                cantidad: cantidadAgregar,
                imagen: producto.imagen
            });
        }

        // ==========================================
        // RECALCULAR TOTAL
        // ==========================================

        carrito.total =
            carrito.items.reduce(
                (total, item) => {

                    return total +
                        (
                            Number(item.precio) *
                            Number(item.cantidad)
                        );

                },
                0
            );

        console.log(
            '>>> Total calculado:',
            carrito.total
        );

        // ==========================================
        // GUARDAR CARRITO
        // ==========================================

        console.log(
            '>>> Guardando carrito en MongoDB...'
        );

        await carrito.save();

        console.log(
            '>>> CARRITO GUARDADO CORRECTAMENTE'
        );

        // ==========================================
        // RESPUESTA
        // ==========================================

        return res.status(200).json({

            mensaje:
                'Producto agregado al carrito',

            carrito: carrito

        });

    } catch (error) {

        console.error(
            '=========================================='
        );

        console.error(
            'ERROR EN agregarProducto:'
        );

        console.error(error);

        console.error(
            'Mensaje:',
            error.message
        );

        console.error(
            '=========================================='
        );

        return res.status(500).json({

            error:
                'Error interno al agregar producto',

            detalle:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : undefined

        });
    }
};

// ==========================================
// ACTUALIZAR CANTIDAD
// PUT /api/carrito/update/:productId
// ==========================================
exports.actualizarCantidad = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { productId } = req.params;
        const { cantidad } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: 'El productId no es válido' });
        }

        const nuevaCantidad = Number(cantidad);
        if (isNaN(nuevaCantidad) || !Number.isInteger(nuevaCantidad) || nuevaCantidad < 0) {
            return res.status(400).json({ error: 'La cantidad no puede ser negativa' });
        }

        const carrito = await Cart.findOne({
            $or: [{ userId: userId }, { usuario: userId }]
        });

        if (!carrito) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        const item = carrito.items.find(
            item => item.productId.toString() === productId.toString()
        );

        if (!item) {
            return res.status(404).json({ error: 'Producto no está en el carrito' });
        }

        if (nuevaCantidad === 0) {
            carrito.items = carrito.items.filter(
                item => item.productId.toString() !== productId.toString()
            );
        } else {
            const producto = await Product.findById(productId);
            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            if (nuevaCantidad > Number(producto.stock)) {
                return res.status(409).json({ error: 'No hay suficiente stock' });
            }

            item.cantidad = nuevaCantidad;
        }

        carrito.total = carrito.items.reduce((total, item) => {
            return total + (Number(item.precio) * Number(item.cantidad));
        }, 0);

        await carrito.save();

        return res.status(200).json({
            mensaje: 'Cantidad actualizada',
            carrito: carrito
        });

    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        return res.status(500).json({ error: 'Error al actualizar cantidad' });
    }
};

// ==========================================
// ELIMINAR PRODUCTO
// DELETE /api/carrito/remove/:productId
// ==========================================
exports.eliminarProducto = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: 'El productId no es válido' });
        }

        const carrito = await Cart.findOne({
            $or: [{ userId: userId }, { usuario: userId }]
        });

        if (!carrito) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        const cantidadAntes = carrito.items.length;
        carrito.items = carrito.items.filter(
            item => item.productId.toString() !== productId.toString()
        );

        if (carrito.items.length === cantidadAntes) {
            return res.status(404).json({ error: 'Producto no está en el carrito' });
        }

        carrito.total = carrito.items.reduce((total, item) => {
            return total + (Number(item.precio) * Number(item.cantidad));
        }, 0);

        await carrito.save();

        return res.status(200).json({
            mensaje: 'Producto eliminado',
            carrito: carrito
        });

    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return res.status(500).json({ error: 'Error al eliminar producto' });
    }
};

// ==========================================
// VACIAR CARRITO
// DELETE /api/carrito/clear
// ==========================================
exports.vaciarCarrito = async (req, res) => {
    try {
        const userId = getUserId(req);

        const carrito = await Cart.findOne({
            $or: [{ userId: userId }, { usuario: userId }]
        });

        if (!carrito) {
            return res.status(200).json({
                mensaje: 'El carrito ya está vacío',
                items: [],
                total: 0
            });
        }

        carrito.items = [];
        carrito.total = 0;

        await carrito.save();

        return res.status(200).json({
            mensaje: 'Carrito vaciado',
            carrito: carrito
        });

    } catch (error) {
        console.error('Error al vaciar carrito:', error);
        return res.status(500).json({ error: 'Error al vaciar carrito' });
    }
};