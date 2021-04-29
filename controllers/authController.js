const passport = require('passport');

//De esta forma importamos el módelo no por el nombre del archivo (../models/Vacantes) sino por 
//el nombre que le dimos al módelo
const mongoose = require('mongoose');
const crypto = require('crypto');
const Vacante = mongoose.model('Vacante');
const Usuario = mongoose.model('Usuario');
const enviarEmail = require('../handlers/email')

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect : '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage : 'Ambos campos (E-mail y Password) son obligatorios'
});

//Revisar si el usuario esta autenticado
exports.verificarAutenticacionUsuario = (req, res, next) => {

        //Verificar autenticación
        if (req.isAuthenticated()) {
            return next();//Esta autenticado
        }

        //Redirecciono a iniciar sesión si no está autenticado
        res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async(req,res) => {

    //consultar las vacantes de un usuario
    const vacantes = await Vacante.find({ autor: req.user._id }).lean();
    
    res.render('administracion', {
        nombrePagina : 'Panel de Administración',
		tagline : 'Crea y Administra tus vacantes',
        cerrarSesion: true,
        nombre: req.user.nombre, 
        imagen: req.user.imagen, 
        vacantes
    });
}

exports.cerrarSesion = (req, res) => {

    //cerramos sesion
    req.logout();
    req.flash('correcto', 'Cerraste Sesión Correctamente');
    //Redirecciono a iniciar sesión si no está autenticado
    res.redirect('/iniciar-sesion');
}

exports.formularioRestablecerPassword = (req, res) => {
    res.render('restablecer-password', {
        nombrePagina : 'Restablecer Password',
        tagline : 'Para restablecer su password es necesario que introduzcas el email que tienes registrado en la aplicación.'
    })
}

//generar el token en la colección del usuario
exports.enviarToken = async (req, res) => {
    //cuando necesito pasar datos a la vista uso el .lean()al final de la clausula
    //cuando son consultas solamente en el controlador no lo uso
    const usuario = await Usuario.findOne({ email: req.body.email });

    if (!usuario) {
        req.flash('error','El usuario no existe');
        return res.redirect('/iniciar-sesion');
    }

    //El usuario existe, generar el token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    //Guardar el usuario
    await usuario.save();

    const resetUrl = `http://${req.headers.host}/restablecer-password/${usuario.token}`;

    //console.log(resetUrl);
    //Enviar notificación por email
    await enviarEmail.enviar({
        usuario,
        subject: 'Resetear Password',
        resetUrl,
        archivo: 'reset'
    });  
    
    //Todo correcto
    req.flash('correcto','Revisa tu correo y sigue las indicaciones para restablecer tu password');
    res.redirect('/iniciar-sesion');

}

//Valida si el token es valido y la fecha de caducidad del token
exports.restablecerPassword = async (req, res) => {
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()//gt (greater than)
        }
    });

    //no existe el usuario o el token ya no es valido
    if (!usuario) {
        req.flash('error','El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/restablecer-password');
    }

    //Todo bien, mostrar el formulario
    res.render('nuevo-password', {
        nombrePagina : 'Modifica tu Password',
        tagline : 'Modifica tu Password'
    })
}

//Almacena el nuevo password en la base de datos
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()//gt (greater than)
        }
    });

    //no existe el usuario o el token ya no es valido
    if (!usuario) {
        req.flash('error','El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/restablecer-password');
    }

    //asiganar nuevo password, limpiar valores previos y guardar en la base de datos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;
    await usuario.save();

    //Todo correcto
    req.flash('correcto','Password modificado correctamente');
    res.redirect('/iniciar-sesion'); 

}



