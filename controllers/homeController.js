const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.mostrarTrabajos = async (req,res,next) => {
	
	// find all documents
	//const vacantes = await Vacante.find({});//Así no funciona
	const vacantes = await Vacante.find({}).lean();

	//Si no hay vacantes
	if (!vacantes) return next();

	res.render('home', {
		nombrePagina : 'devJobs',
		tagline : 'Encuentra y Pública Trabajos para Desarroladores Web',
		barra : true,
		boton : true,
		vacantes
	})
}