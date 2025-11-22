
//importamos la deteccion de erroes
const boom = require('@hapi/boom');

// importamos los modelos
const { models } = require ('./../libs/sequelize')

class LocalidadService {
    async find(){
        const rta = await models.Localidad.findAll();
        return rta;
    }

    //funcion para crear un alumno
    async create (data) {
        const new_locality = await models.Localidad.create(data);
        return new_locality;
    }

}

// exportacion del servicio
module.exports = LocalidadService;
