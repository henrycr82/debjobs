const mongoose      =  require('mongoose');
//mongoose.Promise = global.Promise;
const slug          = require('slug');
const shortid       = require('shortid');
const { Schema }    = mongoose;

const vacantesSchema = new Schema({
    titulo: {
        type: String,
        required: 'El nombre de la vacante es requerido',
        trim: true
    },
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        required: 'La ubicación es requerida',
        trim: true
    },
    salario: {
        type: String,
        default: 0,
        trim: true
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true,
        trim: true
    },
    skills: [String],
    candidatos : [{
        nombre : String,
        email : String,
        cv : String

    }],
    autor : {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: 'El autor es obligatorio'
    }

});

//Antes de guardar
vacantesSchema.pre('save', function(next) {
    //Construimos la url
    const url = slug(this.titulo);
    this.url =  `${url}-${shortid.generate()}`;
    next();
});

//Creamos un indice para realizar búsquedas indexadas
vacantesSchema.index({titulo:'text'})

module.exports = mongoose.model('Vacante', vacantesSchema);