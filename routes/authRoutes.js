const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const oauthController = require('../controllers/oauthController');

const router = express.Router();


// ==========================================
// REGISTRO
// POST /api/register
// ==========================================

router.post('/register', async (req, res) => {

    try {

        const {
            nombre,
            email,
            password
        } = req.body;

        // Verificar si el usuario ya existe
        const existe = await User.findOne({ email });

        if (existe) {

            return res.status(400).json({
                error: 'El usuario ya existe'
            });

        }

        // Encriptar contraseña
        const passwordHash = await bcrypt.hash(
            password,
            10
        );

        // Crear usuario
        const usuario = await User.create({

            nombre,

            email,

            password: passwordHash

        });

        res.status(201).json({

            mensaje:
                'Usuario registrado correctamente'

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                'Error al registrar usuario'

        });

    }

});


// ==========================================
// LOGIN NORMAL
// POST /api/login
// ==========================================

router.post('/login', async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Buscar usuario
        const usuario =
            await User.findOne({ email });


        if (!usuario) {

            return res.status(401).json({

                error:
                    'Credenciales incorrectas'

            });

        }


        // Comparar contraseña
        const passwordCorrecta =
            await bcrypt.compare(
                password,
                usuario.password
            );


        if (!passwordCorrecta) {

            return res.status(401).json({

                error:
                    'Credenciales incorrectas'

            });

        }


        // Crear JWT
        const token =
            jwt.sign(

                {
                    id: usuario._id,
                    email: usuario.email,
                    nombre: usuario.nombre
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        process.env.JWT_EXPIRES_IN || '1h'
                }

            );


        res.json({

            mensaje:
                'Login exitoso',

            token

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                'Error en login'

        });

    }

});


// ==========================================
// GOOGLE OAUTH
// GET /api/auth/google
// ==========================================

router.get(
    '/auth/google',

    passport.authenticate(
        'google',
        {
            scope: [
                'profile',
                'email'
            ]
        }
    )

);


// ==========================================
// GOOGLE CALLBACK
// GET /api/auth/google/callback
// ==========================================

router.get(
    '/auth/google/callback',

    passport.authenticate(
        'google',
        {
            failureRedirect:
                '/login.html'
        }
    ),

    oauthController.googleCallback

);


module.exports = router;