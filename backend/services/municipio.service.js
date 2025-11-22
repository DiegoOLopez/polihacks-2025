
//importamos la deteccion de erroes
//Hapi boom
const boom = require('@hapi/boom');

// importamos los modelos
const { models } = require ('./../libs/sequelize')

class MunicipioService {
    async find(){
        const rta = await models.Municipio.findAll();
        return rta;
    }

    //funcion para crear un alumno
    async create (data) {
        const new_municipe = await models.Municipio.create(data);
        return new_municipe;
    }

}

// exportacion del servicio
module.exports = MunicipioService;
