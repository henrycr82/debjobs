const passport      = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose      = require('mongoose');
const Usuario       = mongoose.model('Usuario');



passport.use(new localStrategy({
    usernameField : 'email',
    passwordField : 'password'
    }, async (email, password, done) => { 
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return done(null, false, {
            message : 'Usuario no Registrado'
        });
        
        const verificarPassword = usuario.compararPassword(password);
        if (!verificarPassword) return done(null, false, {
            message : 'Usuario o Password incorrecto'
        });

        return done(null, usuario);        
}));


passport.serializeUser((usuario, done) => done(null, usuario._id));

passport.deserializeUser(async (id, done) => {
    const usuario = await Usuario.findById(id).lean();
    return done(null, usuario);
});

module.exports = passport;