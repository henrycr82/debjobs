const express			 = require('express');
const router 			 = express.Router() //Para el manejo de rutas
const homeController	 = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController	 = require('../controllers/authController');


module.exports = () => {
	
	router.get('/', homeController.mostrarTrabajos);

	//Crear vacantes
	router.get('/vacantes/nueva', authController.verificarAutenticacionUsuario, vacantesController.formularioNuevaVacante);
	router.post('/vacantes/nueva', authController.verificarAutenticacionUsuario, vacantesController.validarVacante, vacantesController.agregarVacante);

	//Mostrar vacante
	router.get('/vacantes/:url', vacantesController.mostrarVacante);

	//Editar vacante
	router.get('/vacantes/editar/:url', authController.verificarAutenticacionUsuario, vacantesController.formularioEditarVacante);
	router.post('/vacantes/editar/:url', authController.verificarAutenticacionUsuario, vacantesController.validarVacante, vacantesController.editarVacante);

	//Eliminar Vacante
	router.delete('/vacantes/eliminar/:id', authController.verificarAutenticacionUsuario, vacantesController.eliminarVacante);

	//Crear Cuentas
	router.get('/crear-cuenta', usuariosController.formularioCrearCuenta);
	router.post('/crear-cuenta', usuariosController.validarRegistro, usuariosController.crearUsuario);

	//Autenticar usuarios
	router.get('/iniciar-sesion', usuariosController.formularioiniciarSesion);
	router.post('/iniciar-sesion', authController.autenticarUsuario);
	//Cerrar Sesión
	router.get('/cerrar/sesion', authController.verificarAutenticacionUsuario, authController.cerrarSesion );

	//restablecer password
	router.get('/restablecer-password', authController.formularioRestablecerPassword);
	router.post('/restablecer-password', authController.enviarToken);
	router.get('/restablecer-password/:token', authController.restablecerPassword);
	router.post('/restablecer-password/:token', authController.guardarPassword);


	//Panel de administración
	router.get('/administracion',authController.verificarAutenticacionUsuario, authController.mostrarPanel);

	//Editar perfil
	router.get('/editar-perfil', authController.verificarAutenticacionUsuario, usuariosController.formularioEditarPerfil);
	router.post('/editar-perfil', 
		authController.verificarAutenticacionUsuario, 
		//usuariosController.validarPerfil,
		usuariosController.subirImagen,
		usuariosController.editarPerfil);

	//Recibir mensajes de candidatos
	router.post('/vacantes/:url', 
		vacantesController.subirCV,
		vacantesController.contactar);

	//Muestra los candidatos por vacante
	router.get('/candidatos/:id', 
		authController.verificarAutenticacionUsuario,
		vacantesController.mostrarCandidatos
	);

	//Buscador de vacantes
	router.post('/buscador', vacantesController.buscarVacantes);

	//retornamos el router
	return router;
}
