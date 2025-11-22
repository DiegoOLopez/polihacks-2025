
//importamos la deteccion de erroes
const boom = require('@hapi/boom');

// importamos los modelos
const { models } = require ('./../libs/sequelize')

class MesService {
    async find(){
        const rta = await models.Mes.findAll();
        return rta;
    }

  // funcion para buscar una materia
  async findOne(id_mes){
    const mes = await models.Mes.findByPk(id_mes);
    if(!mes){
        throw boom.notFound('Alumno no encontrado');
    }
    return mes;
  }

}

// exportacion del servicio
module.exports = MesService;
