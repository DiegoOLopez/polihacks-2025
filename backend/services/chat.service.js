

//importamos la deteccion de erroes
const boom = require('@hapi/boom');
// importamos los modelos
const { models } = require ('../libs/sequelize')

class Chat {
    async chat(body){
        const rta = "Hello " + body.message;
        return rta;
    }


}

// exportacion del servicio
module.exports = Chat;
