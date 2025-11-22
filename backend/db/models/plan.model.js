const { Model, DataTypes, Sequelize } = require('sequelize')

const { EMPRESA } = require('./empresa.model')

const PLAN = 'plan'

const plan_schema = {

  id_plan:{
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  nombre_plan: {
    allowNull: false,
    type: DataTypes.STRING
  },
  precio: {
    allowNull: false,
    type: DataTypes.INTEGER
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

class Plan extends Model {
  static associate(models){
    // Relacion plan - servicio
    // Donde un plan tiene muchos servicios
    // Y un servicio tiene un plan
    // Especificamos que pertenecera al modelo service, donde (as) servicio tiene una foreignkey llamada id_plan
    this.belongsTo(models.Servicio, { as: 'servicio', foreignKey: 'id_plan' })
  }

  static config(sequelize){
    return {
      sequelize,
      tableName: PLAN,
      modelName: 'Plan',
      timestamps: false
    }
  }
}

module.exports = { PLAN, plan_schema, Plan };
