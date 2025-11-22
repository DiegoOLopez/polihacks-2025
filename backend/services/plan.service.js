
//importamos la deteccion de erroes
const boom = require('@hapi/boom');

// importamos los modelos
const { models } = require ('./../libs/sequelize');

class PlanService {
    async find(id_empresa){
        const rta = await models.Plan.findAll({
            where: {
                id_empresa: id_empresa
            }
        });
        return rta;
    }

    async findOne(id_plan){
      const rta = await models.Plan.findByPk(id_plan);
      if(!rta){
          throw boom.notFound('Plan no encontrado');
      }
      return rta;
    }

    //funcion para crear un alumno
    async create (data) {
        const new_plan = await models.Plan.create(data);
        return new_plan;
    }

}

// exportacion del servicio
module.exports = PlanService;
