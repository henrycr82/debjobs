const nodemailer  = require("nodemailer");
const hbs  = require("nodemailer-express-handlebars");
//const util		  = require("util");//Viene por defecto en node en versiones superios a la 8
const emailConfig = require("../config/email");
const path				= require('path');

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass
    },
});

//Utilizar template handlebars (No me funciono)
transport.use('compile', hbs({
	viewEngine:'handlebars',
	viewPath: __dirname+'/../views/emails',
	extName: '.handlebars'
}));


exports.enviar = async (opciones) => {
  await transport.sendMail({
    from: 'devJobs <no-replay@devjobs.com>', 
	to: opciones.usuario.email, 
	subject: opciones.subject, 
	//template: opciones.archivo,
    html: `
    	<h1 style="text-align:center; font-family: Arial, Helvetica;">Reestablecer Password</h1>
    	<p style="font-family: Arial, Helvetica;">Hola, has solicitado reestablecer tu password, haz click en el siguiente enlace, este enlace es temporal, si se vence es necesario que vuelvas a solicitar otro e-mail.</p>
    	<a style="display:block; font-family: Arial, Helvetica; padding: 1rem; background-color: #00C897; color:white; text-transform:uppercase; text-align:center; text-decoration: none;" href="${opciones.resetUrl}">Resetear Password</a>
    	<p style="font-family: Arial, Helvetica;">Si no puedes acceder a este enlace, visita: ${opciones.resetUrl}</p>
    	<p style="font-family: Arial, Helvetica;">Si no solicitaste este e-mail, puedes ignorarlo</p>
    `, 
	context: {
		resetUrl: opciones.resetUrl
	}
  });
}
