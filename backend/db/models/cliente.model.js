const { Model, DataTypes, Sequelize } = require('sequelize')
const { LOCALIDAD } = require('./localidad.model')
const { EMPRESA } = require('./empresa.model')

const CLIENTE = 'cliente'

const cliente_schema = {
  id_cliente: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  nombre: {
    allowNull: false,
    type: DataTypes.STRING
  },
  apellido_p:{
    allowNull: false,
    type: DataTypes.STRING
  },
  apellido_m: {
    allowNull: false,
    type: DataTypes.STRING
  },
  telefono: {
    allowNull: false,
    type: DataTypes.STRING
  },
  alias: {
    allowNull: false,
    type: DataTypes.STRING
  },
  id_localidad: {
    field: 'id_localidad',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: LOCALIDAD,
      key: 'id_localidad'
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

class Cliente extends Model{
  static associate(models){
    // Tenemos muchos dentro de nuestra tabla cliente tenemos localidades con la referencia de id_localidad
    this.hasMany(models.Cliente, { as: 'localidad', foreignKey: 'id_localidad' })
    // Relacion donde exportamos localidad le pertenecera a cliente
    // Especificiamos que pertenece al modelo Servicio, donde servicio tiene la foreignkey de id_localidad
    this.belongsTo(models.Servicio, { as: 'servicio', foreignKey: 'id_cliente'})

  }

  static config(sequelize){
    return {
      sequelize,
      tableName: CLIENTE,
      modelName: 'Cliente',
      timestamps: false
    }
  }
}


// Exportar tabla, esquema y modelo
module.exports = { CLIENTE, cliente_schema, Cliente }
