const mongoose      =  require('mongoose');
//mongoose.Promise = global.Promise;
const { Schema }    = mongoose;
const bcrypt = require('bcrypt');

const usuariosSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date,
    imagen: String
});

//Método para hashear los passwords
usuariosSchema.pre('save', async function(next) {
    //si el password esta hasheado
    if (!this.isModified('password')) {
        return next();//detenemos laejecución
    }
    //si no está hasheado
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
});

//Validamos que no se almacene un email repetido
usuariosSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
      next('El correo que intentas registrar ya se encuentra asignado a un usuario');
    } else {
      next(error);
    }
});

//Autenticar usuarios
usuariosSchema.methods.compararPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('Usuario', usuariosSchema);