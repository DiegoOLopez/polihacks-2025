const { Model, DataTypes, Sequelize } = require('sequelize')

const { CLIENTE } = require('./cliente.model')
const { PLAN } = require('./plan.model')
const { ACCESS } = require('./access_point.model')
const { EMPRESA } = require('./empresa.model')

const SERVICIO = 'servicio'

const servicio_schema = {

  id_servicio: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  no_servicio:{
    allowNull: false,
    type: DataTypes.STRING
  },
  fecha_inicio: {
    allowNull: false,
    type: DataTypes.DATE
  },
  ubicacion: {
    allowNull: false,
    type: DataTypes.STRING
  },
  ip_antena: {
    allowNull: false,
    type: DataTypes.STRING
  },
  psw_antena: {
    allowNull: false,
    type: DataTypes.STRING
  },
  ip_router: {
    allowNull: false,
    type: DataTypes.STRING
  },
  psw_router: {
    allowNull: false,
    type: DataTypes.STRING
  },
  id_cliente: {
    field: 'id_cliente',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: CLIENTE,
      key: 'id_cliente'
    }
  },
  id_plan: {
    field: 'id_plan',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: PLAN,
      key: 'id_plan'
    }
  },
  id_access: {
    field: 'id_access',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: ACCESS,
      key: 'id_access'
    }
  },
  id_empresa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_empresa',
    references: {
      model: EMPRESA,
      key: 'id_empresa'
    }
  }

}

class Servicio extends Model {
  static associate(models){
    // Importamos todas las foreigns keys
    // Relacion servicio - cliente
    // Tenemos dentro de nuestra tabla servicio la referencia de la tabla cliente con la foreign key id_cliente
    this.hasMany(models.Servicio, { as: 'cliente', foreignKey: 'id_cliente' })
    // Relacion servicio - plan
    // Tenemos dentro de nuestra tabla servicio la referencia de la tabla plan con la foreign key id_plan
    this.hasMany(models.Servicio, { as: 'plan', foreignKey: 'id_plan' })
    // Relacion servicio - access
    // Tenemos dentro de nuestra tabla servicio la referencia de la tabla access con la foreign key id_access
    this.hasMany(models.Servicio, { as: 'access', foreignKey: 'id_access' })

    // Exportamos nuestra tabla
    // Relacion servicio - pago
    // Donde un servicio puede tener muchos pagos
    // Y un pago puede tener un servicio
    // Especificamos que pertenece al modelo pago, donde pago tiene la foreignkey de id_servicio
    this.belongsTo(models.Pago, { as: 'pago', foreignKey: 'id_servicio' })
  }
  static config(sequelize){
    return {
      sequelize,
      tableName: SERVICIO,
      modelName: 'Servicio',
      timestamps: false
    }
  }
}

module.exports = { SERVICIO, servicio_schema, Servicio };
