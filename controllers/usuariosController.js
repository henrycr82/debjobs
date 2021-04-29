const mongoose = require('mongoose');
const Usuario = mongoose.model('Usuario');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');



exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
      //console.log(error);
      if (error) {
        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            req.flash('error', 'El archivo es muy pesado: máximo 100kb');
          }
          else {
            req.flash('error', error.message);
          }
        }
        else
        {
          //Siempre que genero errores de este tipo:
          //cb(new Error('Formato de imagen no válido'), false);
          //accedo al mensaje de error con error.message
          //console.log(error.message);
          req.flash('error', error.message);
        }
        res.redirect('/administracion');
        return;
      } 
      else 
      {
        return next();
      }    
    });
}

const configuracionMulter = {
  limits : { fileSize : 100000 }, //100 kilobytes
  storage : fileStorage = multer.diskStorage({
    destination:  (req, file, cb) => {
      cb(null,__dirname+'../../public/uploads/perfiles/');
    },
    filename:  (req, file, cb) => {
      const extension = file.mimetype.split('/')[1];
      //console.log(`${shortid.generate()}.${extension}`);
      cb(null, `${shortid.generate()}.${extension}`);
    }
  }),
  fileFilter(req, file, cb){
    if (file.mimetype==='image/jpeg' || file.mimetype==='image/png') {
      //el callback se ejecuta como true o false: true cuando laimagen se acepta
      cb(null, true);
    }
    else
    {
      cb(new Error('Formato de imagen no válido'), false);
    }
  }
  
}

const upload = multer(configuracionMulter).single('imagen');

exports.formularioCrearCuenta = (req,res) => {
    
  res.render('crear-cuenta', {
    nombrePagina : 'Crear tu cuenta en DevJobs',
    tagline : 'Comienza a publicar tus vacantes, solo debs crear una cuenta'
  })
}

exports.validarRegistro = async (req, res, next) => {
    const rules = [
      body('nombre')
        .not()
        .isEmpty()
        .withMessage('El campo nombre es obligatorio')
        .escape(),
      body('email')
        .isEmail()
        .withMessage('El campo email es obligatorio')
        .normalizeEmail(),
      body('password')
        .not()
        .isEmpty()
        .withMessage('El password es obligatorio')
        .escape(),
      body('confirmar')
        .not()
        .isEmpty()
        .withMessage('Confirmar password es obligatorio')
        .escape(),
      body('confirmar')
        .equals(req.body.password)
        .withMessage('Los passwords no son iguales'),
    ];
    await Promise.all(rules.map((validation) => validation.run(req)));
    const errores = validationResult(req);
    //si hay errores
    if (!errores.isEmpty()) {
      req.flash(
        'error',// 'error' es una clase de la hoja de estilo
        errores.array().map((error) => error.msg)//recorro los errores y los colo en req.flash
      );
      res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en Devjobs',
        tagline:
          'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
        mensajes: req.flash(),
      });
      console.log(errores);
      return;
    }
    //si toda la validacion es correcta
    next();
};

exports.crearUsuario = async (req, res, next) => {
    
    //Seteamos los campos del body a la instancia del módelo Usuario 
    const usuario = new Usuario(req.body);

    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');//redireccionamos al inicio de sesión
      } catch (error) {
        req.flash('error', error);//cargamos los errores
        res.redirect('/crear-cuenta');//redireccionamos a crear cuenta
    }

    //guardamos
    //const nuevoUsuario = await usuario.save();

    //Si no se puede guardar
    //if (!nuevoUsuario) return next();

    //redireccionamos al inicio de sesión
    //res.redirect('/iniciar-sesion');

}

exports.formularioiniciarSesion = (req,res) => {
  res.render('iniciar-sesion', {
    nombrePagina : 'Iniciar Sesión en DevJobs',
    tagline : 'Iniciar Sesión en DevJobs'
  });
}

exports.formularioEditarPerfil = (req,res) => {
  res.render('editar-perfil', {
    nombrePagina : 'Editar perfil en DevJobs',
    tagline : 'Editar perfil en DevJobs',
    usuario : req.user,
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen
  });
  //res.send(req.user);
}

exports.editarPerfil = async (req, res) => {
  
  const usuario = await Usuario.findById(req.user._id);

  if (usuario) {

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;

    if (req.body.password) {
      usuario.password = req.body.password;
    }

    //para ver el archivo que voy a tratar con multer
    //console.log(req.file);
    //return;

    if (req.file) {
      usuario.imagen = req.file.filename;
    }

    await usuario.save();

    req.flash('correcto', 'Cambios Guardados Exitosamente');

    //redireccionamos al Panel de administración 
    res.redirect('/administracion');
    }
    
    //res.send(usuario);
}

exports.validarPerfil = async (req, res, next) => {
  
  const rules = [
    body('nombre')
      .not()
      .isEmpty()
      .withMessage('El campo nombre es obligatorio')
      .escape(),
    body('email')
      .isEmail()
      .withMessage('El campo email es obligatorio')
      .normalizeEmail(),
    body('password')
      .escape(),
  ];
  
  
  await Promise.all(rules.map((validation) => validation.run(req)));
  const errores = validationResult(req);
  //si hay errores
  if (!errores.isEmpty()) {
    req.flash(
      'error',// 'error' es una clase de la hoja de estilo
      errores.array().map((error) => error.msg)//recorro los errores y los colo en req.flash
    );
    
    res.render('editar-perfil', {
      nombrePagina : 'Editar perfil en DevJobs',
      usuario : req.user,
      cerrarSesion: true,
      nombre: req.user.nombre,
      imagen: req.user.imagen,
      mensajes: req.flash(), 
    });

    return;
  }
  //si toda la validacion es correcta
  next();
};

    