

//importamos la deteccion de erroes
const boom = require('@hapi/boom');
// importamos los modelos
const { models } = require ('./../libs/sequelize')

class Example {
    async hello(body){
        const rta = "Hello " + body.nombre;
        return rta;
    }


}

// exportacion del servicio
module.exports = Example;
