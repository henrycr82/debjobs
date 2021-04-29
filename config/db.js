const mongoose	= require('mongoose');
require('dotenv').config({ path:'variables.env' });//Variables de entorno

//conectamos
mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology: true});

/*mongoose.connection.on('error', (error) => {
	console.log(error);
});*/

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Conexion exitosa con la base de datos');
});

//Importamos los modelos
require('../models/Vacantes');
require('../models/Usuarios');
