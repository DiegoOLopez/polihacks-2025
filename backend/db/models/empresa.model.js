const { Model, DataTypes, Sequelize } = require('sequelize')

const EMPRESA = 'empresa'

const empresaSchema = {
    id_empresa: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    nombre: {
        allowNull: false,
        type: DataTypes.STRING
    },
    telefono: {
        allowNull: false,
        type: DataTypes.STRING
    },
    email: {
        allowNull: false,
        type: DataTypes.STRING
    },
    rfc: {
        allowNull: true,
        type: DataTypes.STRING
    }
}

// Clase Empresa para enviar a la base de datos
class Empresa extends Model {
    static associate(models) {
        //Se envia la llave primary key de la tabla Empresa a todas las tablas 
        this.belongsTo(models.Access, { as: 'access', foreignKey: 'id_empresa' })
        this.belongsTo(models.Anio, { as: 'anio', foreignKey: 'id_empresa' })
        this.belongsTo(models.Mes, { as: 'mes', foreignKey: 'id_empresa' })
        this.belongsTo(models.Cliente, { as: 'cliente', foreignKey: 'id_empresa' })
        this.belongsTo(models.Pago, { as: 'pago', foreignKey: 'id_empresa' })
        this.belongsTo(models.Usuario, { as: 'usuario', foreignKey: 'id_empresa' })
        this.belongsTo(models.Plan, { as: 'plan', foreignKey: 'id_empresa' })
        this.belongsTo(models.Servicio, { as: 'servicio', foreignKey: 'id_empresa' })
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: EMPRESA,
            modelName: 'Empresa',
            timestamps: false
        }
    }
}

// Exportamos el modelo
module.exports = {EMPRESA, empresaSchema, Empresa};