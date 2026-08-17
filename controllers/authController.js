const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    const { username, password } = req.body;

    // Usuario de prueba
   if (username === "admin" && password === "admin123") {

        const token = jwt.sign(
            { username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({
            mensaje: 'Login correcto',
            token
        });
    }

    return res.status(401).json({
        mensaje: 'Credenciales incorrectas'
    });
};

exports.register = (req, res) => {
    res.json({
        mensaje: 'Usuario registrado correctamente'
    });
};