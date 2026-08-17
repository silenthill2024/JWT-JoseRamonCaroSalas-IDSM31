const jwt = require('jsonwebtoken');

const googleCallback = (req, res) => {

    const token = jwt.sign(

        {
            id: req.user._id,
            email: req.user.email,
            nombre: req.user.nombre
        },

        process.env.JWT_SECRET,

        {
            expiresIn:
                process.env.JWT_EXPIRES_IN || '1h'
        }
    );


    // Redirigir al frontend

    res.redirect(
        `/carrito.html?token=${token}`
    );
};


module.exports = {
    googleCallback
};