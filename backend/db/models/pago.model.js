const { Model, DataTypes, Sequelize } = require('sequelize')

const { SERVICIO } = require('./servicio.model')
const { MES } = require('./mes.model')
const { ANIO } = require('./anio.model')
const { EMPRESA } = require('./empresa.model')
const { USUARIO } = require('./usuario.model')

const PAGO = 'pago'

const pago_schema = {

  id_pago: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  fecha_pago: {
    allowNull: false,
    type: DataTypes.DATE
  },
  id_servicio: {
    field: 'id_servicio',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: SERVICIO,
      key: 'id_servicio'
    }
  },
  id_mes: {
    field: 'id_mes',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: MES,
      key: 'id_mes'
    }
  },
  id_anio: {
    field: 'id_anio',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: ANIO,
      key: 'id_anio'
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
  },

  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_usuario',
    references: {            // Referencia a la tabla usuario
      model: USUARIO,     // nombre de la tabla en la DB
      key: 'id_usuario'
    }
  }

}

class Pago extends Model {
  static associate(models){
    // Importamos las foreigns keys
    // Tenemos dentro de la tabla de pago la referencia de la tabla servicio con la foreign key id_servicio
    this.hasMany(models.Pago, { as: 'servicio', foreignKey: 'id_servicio' })


    // Bla bla bla soy programador

    this.hasMany(models.Pago, { as: 'mes', foreignKey: 'id_mes'});
    this.hasMany(models.Pago, { as: 'anio', foreignKey: 'id_anio' })

    this.hasMany(models.Pago, { as: 'usuario', foreignKey: 'id_usuario' })
  }

  static config(sequelize){
    return {
      sequelize,
      tableName: PAGO,
      modelName: 'Pago',
      timestamps: false
    }
  }

}

module.exports = { PAGO, pago_schema, Pago }
