const Cart = require('../models/Cart');
const Product = require('../models/Product');


// ==========================================
// OBTENER CARRITO
// GET /api/carrito
// ==========================================

exports.obtenerCarrito = async (req, res) => {

    try {

        const userId = req.user.id;

        let carrito =
            await Cart.findOne({ userId });

        if (!carrito) {

            carrito = await Cart.create({
                userId,
                items: [],
                total: 0
            });
        }

        res.json(carrito);

    } catch (error) {

        console.error(
            'Error obteniendo carrito:',
            error
        );

        res.status(500).json({
            error: 'Error al obtener carrito'
        });
    }
};


// ==========================================
// AGREGAR PRODUCTO
// POST /api/carrito/add
// ==========================================

exports.agregarProducto = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            productId,
            cantidad
        } = req.body;

        if (!productId) {

            return res.status(400).json({
                error: 'productId es obligatorio'
            });
        }

        const cantidadAgregar =
            Number(cantidad || 1);

if (!productId || cantidad === undefined) {
    return res.status(400).json({
        error: 'productId y cantidad son obligatorios'
    });
}

if (cantidad <= 0) {
    return res.status(400).json({
        error: 'La cantidad debe ser mayor a 0'
    });
}

        // Buscar producto
        const producto =
            await Product.findById(productId);

        if (!producto) {

            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        // Verificar stock
        if (
            producto.stock <
            cantidadAgregar
        ) {

            return res.status(409).json({
                error: 'Producto sin stock suficiente'
            });
        }


        // Buscar carrito
        let carrito =
            await Cart.findOne({ userId });


        // Si no existe, crearlo
        if (!carrito) {

            carrito = new Cart({
                userId,
                items: [],
                total: 0
            });
        }


        // Buscar producto dentro del carrito
        const itemExistente =
            carrito.items.find(
                item =>
                    item.productId.toString() ===
                    productId.toString()
            );


        if (itemExistente) {

            const nuevaCantidad =
                itemExistente.cantidad +
                cantidadAgregar;


            if (
                nuevaCantidad >
                producto.stock
            ) {

                return res.status(409).json({
                    error:
                        'No hay suficiente stock'
                });
            }


            itemExistente.cantidad =
                nuevaCantidad;

        } else {

            carrito.items.push({

                productId:
                    producto._id,

                nombre:
                    producto.nombre,

                precio:
                    producto.precio,

                cantidad:
                    cantidadAgregar,

                imagen:
                    producto.imagen
            });
        }


        // Calcular total
        carrito.total =
            carrito.items.reduce(
                (total, item) => {

                    return total +
                        (
                            item.precio *
                            item.cantidad
                        );

                },
                0
            );


        await carrito.save();


        res.status(200).json({

            mensaje:
                'Producto agregado al carrito',

            carrito

        });


    } catch (error) {

        console.error(
            'Error agregando producto:',
            error
        );

        res.status(404).json({
            error:
                'Error al agregar producto'
        });
    }
};


// ==========================================
// ACTUALIZAR CANTIDAD
// PUT /api/carrito/update/:productId
// ==========================================

exports.actualizarCantidad = async (
    req,
    res
) => {

    try {

        const userId = req.user.id;

        const { productId } =
            req.params;

        const { cantidad } =
            req.body;


        const nuevaCantidad =
            Number(cantidad);


        if (
            !Number.isInteger(
                nuevaCantidad
            )
        ) {

            return res.status(400).json({
                error:
                    'La cantidad debe ser un número entero'
            });
        }


        const carrito =
            await Cart.findOne({ userId });


        if (!carrito) {

            return res.status(404).json({
                error:
                    'Carrito no encontrado'
            });
        }


        const item =
            carrito.items.find(
                item =>
                    item.productId.toString() ===
                    productId
            );


        if (!item) {

            return res.status(404).json({
                error:
                    'Producto no está en el carrito'
            });
        }


        // Si es 0, eliminar
        if (nuevaCantidad === 0) {

            carrito.items =
                carrito.items.filter(
                    item =>
                        item.productId.toString() !==
                        productId
                );

        } else {

            if (nuevaCantidad < 0) {

                return res.status(400).json({
                    error:
                        'La cantidad no puede ser negativa'
                });
            }

            item.cantidad =
                nuevaCantidad;
        }


        carrito.total =
            carrito.items.reduce(
                (total, item) =>
                    total +
                    item.precio *
                    item.cantidad,
                0
            );


        await carrito.save();


        res.json({

            mensaje:
                'Cantidad actualizada',

            carrito

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                'Error al actualizar cantidad'
        });
    }
};


// ==========================================
// ELIMINAR PRODUCTO
// DELETE /api/carrito/remove/:productId
// ==========================================

exports.eliminarProducto = async (
    req,
    res
) => {

    try {

        const userId = req.user.id;

        const { productId } =
            req.params;


        const carrito =
            await Cart.findOne({ userId });


        if (!carrito) {

            return res.status(404).json({
                error:
                    'Carrito no encontrado'
            });
        }


        carrito.items =
            carrito.items.filter(
                item =>
                    item.productId.toString() !==
                    productId
            );


        carrito.total =
            carrito.items.reduce(
                (total, item) =>
                    total +
                    item.precio *
                    item.cantidad,
                0
            );


        await carrito.save();


        res.json({

            mensaje:
                'Producto eliminado',

            carrito

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                'Error al eliminar producto'
        });
    }
};


// ==========================================
// VACIAR CARRITO
// DELETE /api/carrito/clear
// ==========================================

exports.vaciarCarrito = async (
    req,
    res
) => {

    try {

        const userId = req.user.id;


        const carrito =
            await Cart.findOne({ userId });


        if (!carrito) {

            return res.json({
                mensaje:
                    'El carrito ya está vacío'
            });
        }


        carrito.items = [];

        carrito.total = 0;


        await carrito.save();


        res.json({

            mensaje:
                'Carrito vaciado',

            carrito

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                'Error al vaciar carrito'
        });
    }
};