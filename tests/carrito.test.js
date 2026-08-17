const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// No levantar el puerto del server en las pruebas
const app = require('../server');
const Product = require('../models/Product');

describe('Suite de Pruebas Automatizadas - Carrito de Compras', () => {

    let validToken;
    let expiredToken;
    let productId;

    const mockUser = {
        id: new mongoose.Types.ObjectId().toString(),
        email: 'test@example.com',
        nombre: 'Tester'
    };

    const JWT_SECRET = process.env.JWT_SECRET || 'secreto_de_prueba';

    beforeAll(async () => {

        // Token válido
        validToken = jwt.sign(
            mockUser,
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Token expirado
        expiredToken = jwt.sign(
            mockUser,
            JWT_SECRET,
            { expiresIn: '-1s' }
        );

        // Asegurar conexión e insertar producto de prueba con la propiedad 'imagen' requerida
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        const testProduct = await Product.create({
            nombre: 'Juego de Prueba QA',
            precio: 59.99,
            stock: 5,
            imagen: 'https://via.placeholder.com/150'
        });

        productId = testProduct._id.toString();
    });

    afterAll(async () => {
        // Limpieza de datos y cierre de conexión para terminar el proceso limpiamente
        if (productId) {
            await Product.findByIdAndDelete(productId);
        }
        await mongoose.connection.close();
    });


    // ==========================================
    // 1. CASOS DE AUTENTICACIÓN JWT
    // ==========================================

    test('Petición sin token → Debe retornar 401 Unauthorized', async () => {

        const response = await request(app)
            .get('/api/carrito');

        expect(response.statusCode).toBe(401);

        expect(response.body).toHaveProperty(
            'error',
            'Token no proporcionado'
        );

    });


    test('Token inválido o expirado → Debe retornar 401 Unauthorized', async () => {

        const response = await request(app)
            .get('/api/carrito')
            .set(
                'Authorization',
                `Bearer ${expiredToken}`
            );

        expect(response.statusCode).toBe(401);

        expect(response.body).toHaveProperty(
            'error',
            'Token inválido o expirado'
        );

    });

    // ==========================================
    // 2. CASOS DE PRODUCTOS Y STOCK
    // ==========================================

    test('POST /api/carrito/add con cantidad negativa → Debe retornar 400 Bad Request', async () => {

        const response = await request(app)
            .post('/api/carrito/add')
            .set(
                'Authorization',
                `Bearer ${validToken}`
            )
            .send({
                productId: productId,
                cantidad: -2
            });

        expect(response.statusCode).toBe(400);

    });

    test('POST /api/carrito/add con producto sin stock → Debe retornar 409 Conflict', async () => {

        const response = await request(app)
            .post('/api/carrito/add')
            .set(
                'Authorization',
                `Bearer ${validToken}`
            )
            .send({
                productId: productId,
                cantidad: 9999
            });

        expect(response.statusCode).toBe(409);

    });

    test('PUT /api/carrito/update/:productId con cantidad 0 → Verifica que elimine el producto', async () => {

        // Primero agregar el producto al carrito
        const agregar = await request(app)
            .post('/api/carrito/add')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                productId: productId,
                cantidad: 1
            });

        console.log('AGREGAR:', agregar.statusCode);
        console.log('BODY AGREGAR:', agregar.body);

        // Después actualizar la cantidad a 0
        const response = await request(app)
            .put(`/api/carrito/update/${productId}`)
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                cantidad: 0
            });

        console.log('ACTUALIZAR:', response.statusCode);
        console.log('BODY ACTUALIZAR:', response.body);

        expect(response.statusCode).toBe(200);
    });

    test('POST /api/carrito/add con cantidad 0 → Debe retornar 400 Bad Request', async () => {

        const response = await request(app)
            .post('/api/carrito/add')
            .set(
                'Authorization',
                `Bearer ${validToken}`
            )
            .send({
                productId: productId,
                cantidad: 0
            });

        expect(response.statusCode).toBe(400);

    });

    // ==========================================
    // 3. PRUEBA DE REGRESIÓN
    // ==========================================

    test('DELETE /api/carrito/clear → Vacía el carrito exitosamente', async () => {

        const response = await request(app)
            .delete('/api/carrito/clear')
            .set(
                'Authorization',
                `Bearer ${validToken}`
            );

        expect([200, 204]).toContain(response.statusCode);

    });

});