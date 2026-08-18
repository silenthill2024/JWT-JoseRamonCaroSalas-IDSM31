const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization;

        console.log('>>> AUTH MIDDLEWARE');
        console.log('Authorization recibido:', !!authHeader);

        if (!authHeader) {
            return res.status(401).json({
                error: 'Token no proporcionado'
            });
        }

        const partes =
            authHeader.split(' ');

        if (
            partes.length !== 2 ||
            partes[0] !== 'Bearer'
        ) {
            return res.status(401).json({
                error: 'Formato de token inválido'
            });
        }

        const token = partes[1];

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        console.log('>>> JWT VALIDADO');
        console.log('Usuario:', decoded);

        req.user = decoded;

        console.log('>>> EJECUTANDO next()');

        next();

    } catch (error) {

        console.error(
            'Error JWT:',
            error.message
        );

        return res.status(401).json({
            error: 'Token inválido o expirado'
        });
    }
}

module.exports = authMiddleware;