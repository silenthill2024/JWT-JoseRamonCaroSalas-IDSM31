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
        secret: 'session_secret',
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
// CONEXIÓN MONGODB
// ==========================================

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB conectado');
    })
    .catch(error => {
        console.error(
            'Error conectando MongoDB:',
            error
        );
    });


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
// INICIAR SERVIDOR
// ==========================================

if (process.env.NODE_ENV !== 'test') {

    app.listen(PORT, () => {

        console.log(
            `Servidor ejecutándose en http://localhost:${PORT}`
        );

    });

}


module.exports = app;