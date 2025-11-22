
//importamos la deteccion de erroes
const boom = require('@hapi/boom');

// importamos los modelos
const { models } = require ('./../libs/sequelize');

class ClienteService {
    async find(){
        const rta = await models.Cliente.findAll();
        return rta;
    }

    //funcion para crear un alumno
    async create (data) {
        const new_client = await models.Cliente.create(data);
        return new_client;
    }

    async patch(id, changes) {
        const cliente = await models.Cliente.findByPk(id);
        const rta = await cliente.update(changes);
        return rta;
    }

}

// exportacion del servicio
module.exports = ClienteService;
