//una forma de importar el módelo
//const Vacante = require('../models/Vacantes');

//De esta forma importamos el módelo no por el nombre del archivo (../models/Vacantes) sino por 
//el nombre que le dimos al módelo
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');

//const Vacante = mongoose.model('Vacante', vacantesSchema);

exports.formularioNuevaVacante = (req,res) => {
    //res.send('controlador vacantes.js método formularioNuevaVacante');
    res.render('nueva-vacante', {
      nombrePagina : 'Nueva Vacante',
      tagline : 'Llena el formulario y publica tu vacante',
      cerrarSesion: true,
      nombre: req.user.nombre,
      imagen: req.user.imagen
    });
}

exports.agregarVacante = async(req, res) =>{
    //res.send('controlador vacantes.js método agregarVacante');
    //Seteamos los campos del body a la instancia del módelo Vacante 
    const vacante = new Vacante(req.body);
    
    //usuario autor de la vacante
    vacante.autor = req.user._id;

    //crear arreglo de habilidades
    vacante.skills = req.body.skills.split(',');
    //res.send(vacante);
    //almacenarlo en la base de datos
    const nuevaVacante = await vacante.save();

    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);
    //res.send('Se guardaron los datos');
}

exports.mostrarVacante = async(req,res,next) => {

  //así no me funciona 
  //const vacante = await Vacante.findOne({ url: req.params.url }).exec();
  //populate('autor') permite hacer referencia a documentos en otras colecciones.
  const vacante = await Vacante.findOne({ url: req.params.url }).lean().populate('autor');

  //console.log(vacante);

  //Si no hay resultados
	if (!vacante) return next();

  res.render('vacante', {
    vacante,
		nombrePagina : vacante.titulo,
    tagline : `Vacante ${vacante.titulo}`,
		barra : true
  })
}

exports.formularioEditarVacante = async (req,res,next) => {
  
  const vacante = await Vacante.findOne({ url: req.params.url }).lean();

  //Si no hay resultados
	if (!vacante) return next();
  
  res.render('editar-vacante', {
    vacante,
    nombrePagina :`Editar ${vacante.titulo}`,
    tagline : `Editar ${vacante.titulo}`,
    cerrarSesion: true,
    nombre: req.user.nombre,
     imagen: req.user.imagen
  })
}

exports.editarVacante = async (req, res) => {
  
  
  //Obtenemos los campos del body 
  const vacanteActualizada = req.body;

  //crear arreglo de habilidades
  vacanteActualizada.skills = req.body.skills.split(',');
 
  //Buscamos la vacante que deseamos actualizar y luego la actualizamos
  const vacante = await Vacante.findOneAndUpdate(
    { url: req.params.url },
    vacanteActualizada,
    {
      new: true,//para que traiga el registro que acabamos de actualizar
      runValidators: true,//para que corra las validaciones del modelo
    },
    
  );

  //retornamos a mostrarVacante
  res.redirect(`/vacantes/${vacante.url}`);
};

//Validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = async (req, res, next) => {
  const rules = [
    body('titulo')
      .not()
      .isEmpty()
      .withMessage('El campo titulo es obligatorio')
      .escape(),
    body('empresa')
      .not()
      .isEmpty()
      .withMessage('El campo empresa es obligatorio')
      .escape(),
    body('ubicacion')
      .not()
      .isEmpty()
      .withMessage('El campo ubicacion es obligatorio')
      .escape(),
    body('salario')
      .not()
      .isEmpty()
      .withMessage('El campo salario es obligatorio')
      .escape(),
    body('contrato')
      .not()
      .isEmpty()
      .withMessage('El campo contrato es obligatorio')
      .escape(),
    body('skills')
      .not()
      .isEmpty()
      .withMessage('Debe seleccionar al menos una habilidad')
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
    
    if (req.params.url) {

      const vacante = await Vacante.findOne({ url: req.params.url }).lean();

      //Si no hay resultados
      if (!vacante) return next();


      res.render('editar-vacante', {
        vacante,
        nombrePagina :`Editar ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        mensajes: req.flash()
      })
    } else { 
      res.render('nueva-vacante', {
        nombrePagina : 'Nueva Vacante',
        tagline : 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        mensajes: req.flash()
      });
    }

    return;
  }

  //si toda la validacion es correcta
  next();

}

exports.eliminarVacante = async (req, res) => {
  
  //Obtenemos por destructuring el Id
  const {id} = req.params;

  const vacante = await Vacante.findById(id);

  if (verificarAutor(vacante, req.user)) {
    //usuario dueño de la vacante, puede eliminar
    vacante.remove();
    res.status(200).send('La vacante ha sido eliminada exitosamente');
  } else {
    //este usuario no puede eliminar la vacante
    res.status(403).send('La vacante no puede ser eliminada');
  }

  //console.log(id);
  
}

const verificarAutor = (vacante={}, usuario={}) => {
  if (!vacante.autor.equals(usuario._id)) {
    return false;
  }
  return true;
}

//Subir curriculum en PDF
exports.subirCV = (req, res, next) => {
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
        res.redirect('back');//me reenvia a la página donde estamos (vacante.handelbars)
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
      cb(null,__dirname+'../../public/uploads/cv/');
    },
    filename:  (req, file, cb) => {
      const extension = file.mimetype.split('/')[1];
      //console.log(`${shortid.generate()}.${extension}`);
      cb(null, `${shortid.generate()}.${extension}`);
    }
  }),
  fileFilter(req, file, cb){
    if (file.mimetype==='application/pdf') {
      //el callback se ejecuta como true o false: true cuando laimagen se acepta
      cb(null, true);
    }
    else
    {
      cb(new Error('Formato no válido'), false);
    }
  }
  
}
// single('cv'); nombre del campo que vamos a subir. esta en (vacante.handelbars)
const upload = multer(configuracionMulter).single('cv');

//almacenar los candidatos en la base de datos
exports.contactar = async(req, res, next) => {
  //res.send(req.params.url);
  const vacante = await Vacante.findOne({ url: req.params.url });

  //Si no existe la vacante
  if (!vacante) return next();

  //todo bien, construir el nuevo objeto
  const nuevoCandidato = {
    nombre: req.body.nombre,
    email: req.body.email,
    cv: req.file.filename //para acceder al nombre del archivo lo hago con multer
  }

  //almacenar la vacante
  vacante.candidatos.push(nuevoCandidato);
  await vacante.save();
  
  //mensaje falsh y redireccionamiento
  req.flash('correcto', 'Se envió tu curriculum exitosamente');
  res.redirect('/');//lo enviamos a la página principal
}

exports.mostrarCandidatos = async(req, res, next) => {
  //res.send(req.params.id);
  const vacante = await Vacante.findById(req.params.id).lean();
  // .lean() para obtener un objeto JSON

  //console.log(vacante.autor);
  //console.log(req.user._id);
  //console.log(typeof vacante.autor);
  //console.log(typeof req.user._id);
  //return;


  //if (vacante.autor===req.user._id) {
  if (vacante.autor != req.user._id.toString()) { //asi si los podemos comparar
    return next();
  }

  if (!vacante) return next();

  //console.log(vacante.titulo);
  
  res.render('candidatos', {
    nombrePagina : `Candidatos Vacante - ${vacante.titulo}`,
    tagline : `Candidatos Vacante - ${vacante.titulo}`,
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    candidatos: vacante.candidatos
  });

}

exports.buscarVacantes = async(req, res) => {
  const vacantes = await Vacante.find({$text:{$search:req.body.q}}).lean();

  res.render('home', {
    nombrePagina : 'devJobs',
    tagline : `Resultados de la búsqueda : ${req.body.q}`,
    barra : true,
    boton : true,
    vacantes
  })

}





