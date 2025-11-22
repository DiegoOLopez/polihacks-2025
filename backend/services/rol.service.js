const { models } = require('../libs/sequelize');

class RolService {
    // Funcion para buscar todos los estudiantes (findAll)
    async findAll(){
        const roles = await models.Roles.findAll();
        return roles;
    }

    // Funcion para buscar un estudiante por su id (findVyPk)
    async findById(id){
        const rol = await models.Roles.findByPk(id);
        return rol;
    }

    // Funcion para crear un estudiante (create)
    async create(rol){
        const rolcreated = await models.Roles.create(rol);
        return rolcreated;
    }

    // Funcion para actualizar un estudiante (update)
    async updateById(id, rol){
        const rolUpdated = await models.Roles.findByPk(id);
        const result = await rolUpdated.update(rol);
        return result
    }

    // Funcion para eliminar un estudiante (destroy)
    async deleteById(id){
        const rol = await models.Roles.destroy({
            where: {
                id_rol: id
            }
        });
        return rol;
    }
}

module.exports = RolService;