
//importamos la deteccion de erroes
const boom = require('@hapi/boom');

// importamos los modelos
const { models } = require ('./../libs/sequelize');

class AccessService {
    async find(id_empresa){
        const rta = await models.Access.findAll({
            where: {
                id_empresa: id_empresa
            }
        });
        return rta;
    }

    //funcion para crear un alumno
    async create (data) {
        const new_access = await models.Access.create(data);
        return new_access;
    }

}

// exportacion del servicio
module.exports = AccessService;
