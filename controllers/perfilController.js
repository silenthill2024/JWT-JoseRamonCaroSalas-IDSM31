const perfilController = {

    getProfile: async (req, res) => {
        try {

            const perfilUsuario = {
                username: req.user.username,
                role: req.user.role,
                juegosFavoritos: [
                    "the witcher 3",
                    "fallout new vegas",
                    "minecraft",
                    "gta-4"
                ],
                saldo: 5000,
                ultimaCompra: [
                    { juego: "Super mario bros wonder", precio: 1200 },
                    { juego: "Portal 2", precio: 600 },
                    { juego: "Black Ops 1&2", precio: 1800 },
                    { juego: "King of fighters 15", precio: 1200 }
                ]
            };

            res.json({
                mensaje: "Acceso autorizado",
                perfil: perfilUsuario
            });

        } catch(error) {

            console.error(error);

            res.status(500).json({
                error: "Error al obtener el perfil"
            });
        }
    }

};

module.exports = perfilController;