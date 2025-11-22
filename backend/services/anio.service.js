
//importamos la deteccion de erroes
const boom = require('@hapi/boom');

// importamos los modelos
const { models } = require ('./../libs/sequelize')

class AnioService {
    async find(){
        const rta = await models.Anio.findAll();
        return rta;
    }

  // funcion para buscar una materia
  async findOne(id_anio){
    const anio = await models.Anio.findByPk(id_anio);
    if(!anio){
        throw boom.notFound('Alumno no encontrado');
    }
    return anio;
  }

}

// exportacion del servicio
module.exports = AnioService;
