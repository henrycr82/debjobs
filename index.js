const mongoose		= require('mongoose');
require('./config/db');

const express			= require('express');
const exphbs			= require('express-handlebars');
const path				= require('path');
const routes 			= require('./routes')//Rutas
const cookieParser		= require('cookie-parser');
const session			= require('express-session');
const MongoStore		= require('connect-mongo')(session);
const bodyParser		= require('body-parser');
//const expressValidator	= require('express-validator'); No hace falta a partir de la versión 6
const flash				= require('connect-flash');
var createError 		= require('http-errors');
const passport			= require('./config/passport');

require('dotenv').config({ path:'variables.env' });//Variables de entorno

//creamos la app
const app 		= express();

//Habilitar bodyParser para poder leer valores que paso por el body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//validación de campos
//app.use(expressValidator()); No hace falta a partir de la versión 6

//Habilitar el template engine handlebars
// 'layout' se encuentra en views/layouts/layout.handlebars
app.engine('handlebars', 
	exphbs({
		defaultLayout: 'layout',
		helpers: require('./helpers/handlebars')//importamos el helper handlebars
	})
);
app.set('view engine', 'handlebars');

//Archivos estaticos
//app.set(express.static(path.join(__dirname, 'public')));//Así no me funciona
app.use(express.static('public'));

app.use(cookieParser());

app.use(session({
	secret: process.env.SECRETO,//para firmar la sesión
	key: process.env.KEY,//para firmar la sesión
	resave: false,//hace que las sesiones no se guarden nuevamente
	saveUninitialized: false,//si el usuario no hace nada no se guarda la sesión
	store: new MongoStore({ mongooseConnection : mongoose.connection })
}));

//Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//Alertas y flash messages
app.use(flash());

//crear nuestro middleware
app.use((req,res,next) => {
	res.locals.mensajes = req.flash();
	next();
});

//Prabamos que todo funcione
app.use('/', routes());

//Códigos de estado HTTP
app.use((req, res, next) => {
  next(createError(404, 'Página no encontrada'));
})
//Administración de los errores. El primer parametro cuando hay un error es el error
//Los errores que genero con new Error() accedo al mensaje de error con error.message. 
app.use((error,req,res) => {
	const status = error.staus || 500;
	//guardo el error en una variable global
	res.locals.mensaje = error.message;
	res.locals.status = status;
	res.status(status);
	res.render('error');

});



//de la variable de entorno process.env.PUERTO leemos el puerto de forma local cuando hago el desplegue heroku asiga el puerto
const host = '0.0.0.0';
const port = process.env.PORT;

app.listen(host,port, () => {
    console.log('Escuchando por el puerto:', process.env.PORT);
});

/* LOCAL
app.listen(process.env.PUERTO, () => {
    console.log('Escuchando por el puerto:', process.env.PUERTO);
});
*/