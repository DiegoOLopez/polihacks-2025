
//importamos la deteccion de erroes
const boom = require('@hapi/boom');

// importamos los modelos
const { models } = require ('./../libs/sequelize')

class EstadoService {
    async find(){
        const rta = await models.Estado.findAll();
        return rta;
    }

    //funcion para crear un alumno
    async create (data) {
        const new_state = await models.Estado.create(data);
        return new_state;
    }

  // funcion para buscar una materia
  async findOne(id_estado){
    const estado = await models.Estado.findByPk(id_estado);
    if(!estado){
        throw boom.notFound('Alumno no encontrado');
    }
    return estado;
  }

    //funcion para actualizar uan tarea
    async update(id_estado, changes){
        const estado = await this.findOne(id_estado);
        const update_estado = await estado.update(changes);
        return update_estado;
    }

    //funcion para eliminar
    async delete(id_estado){
        const estado = await this.findOne(id_estado);
        await estado.destroy();
        return {id_estado};
    }
}

// exportacion del servicio
module.exports = EstadoService;
