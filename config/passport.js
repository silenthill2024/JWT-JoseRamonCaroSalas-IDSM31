const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

require("dotenv").config();


// ==========================================
// GOOGLE OAUTH
// ==========================================

if (
    process.env.NODE_ENV !== 'test' &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
) {

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL
            },

            async (accessToken, refreshToken, profile, done) => {

                try {

                    console.log("Usuario autenticado con Google:");
                    console.log(profile);

                    let usuario = await User.findOne({
                        googleId: profile.id
                    });

                    if (!usuario) {

                        usuario = await User.create({

                            nombre: profile.displayName,

                            email:
                                profile.emails?.[0]?.value,

                            googleId: profile.id

                        });
                    }

                    return done(null, usuario);

                } catch (error) {

                    console.error(
                        "Error en autenticación Google:",
                        error
                    );

                    return done(error, null);
                }
            }
        )
    );

}


// ==========================================
// SERIALIZAR USUARIO
// ==========================================

passport.serializeUser((user, done) => {

    done(null, user._id);

});


// ==========================================
// DESERIALIZAR USUARIO
// ==========================================

passport.deserializeUser(async (id, done) => {

    try {

        const user =
            await User.findById(id);

        done(null, user);

    } catch (error) {

        done(error, null);

    }

});