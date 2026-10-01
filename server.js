require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');

const app = express();

// ==========================================
// MIDDLEWARES
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// ==========================================
// ARCHIVOS FRONTEND
// ==========================================

app.use(express.static('public'));

// ==========================================
// SESIONES
// ==========================================

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'session_secret',
        resave: false,
        saveUninitialized: false
    })
);

// ==========================================
// PASSPORT
// ==========================================

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport');

// ==========================================
// RUTAS
// ==========================================

const authRoutes =
    require('./routes/authRoutes');

const cartRoutes =
    require('./routes/cartRoutes');

const productRoutes =
    require('./routes/productRoutes');

app.use(
    '/api',
    authRoutes
);

app.use(
    '/api/carrito',
    cartRoutes
);

app.use(
    '/api/productos',
    productRoutes
);

// ==========================================
// SERVIDOR
// ==========================================

const PORT =
    process.env.PORT || 3000;

// ==========================================
// CONEXIÓN A MONGODB
// ==========================================

async function iniciarServidor() {

    try {

        console.log('==========================================');
        console.log('CONECTANDO A MONGODB');
        console.log('==========================================');

        console.log(
            'MongoDB URI:',
            process.env.MONGODB_URI
                ? 'Configurada'
                : 'NO CONFIGURADA'
        );

        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log('MongoDB conectado correctamente');

        // ==========================================
        // INICIAR SERVIDOR
        // ==========================================

        if (process.env.NODE_ENV !== 'test') {

            app.listen(
                PORT,
                '0.0.0.0',
                () => {

                    console.log(
                        '=========================================='
                    );

                    console.log(
                        `Servidor ejecutándose en puerto ${PORT}`
                    );

                    console.log(
                        `http://0.0.0.0:${PORT}`
                    );

                    console.log(
                        '=========================================='
                    );

                }
            );

        }

    } catch (error) {

        console.error(
            '=========================================='
        );

        console.error(
            'ERROR CONECTANDO A MONGODB'
        );

        console.error(
            '=========================================='
        );

        console.error(error);

        process.exit(1);
    }
}

// ==========================================
// INICIAR APLICACIÓN
// ==========================================

iniciarServidor();

// ==========================================
// EXPORTAR APP
// ==========================================

module.exports = app;
```
