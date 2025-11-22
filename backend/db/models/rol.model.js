const { Model, DataTypes, Sequelize } = require('sequelize')

const ROL = 'rol';

const rolSchema = {
    id_rol: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    rol: {
        allowNull: false,
        type: DataTypes.STRING
    }
}

class Rol extends Model {
    static associate(models) {
        this.belongsTo(models.Usuario, { as: 'usuario', foreignKey: 'id_rol' })
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: ROL,
            modelName: 'Rol',
            timestamps: false
        }
    }
}


module.exports = { ROL, rolSchema, Rol };