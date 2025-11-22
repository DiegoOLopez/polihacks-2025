const { Model, DataTypes, Sequelize } = require('sequelize')
const { MUNICIPIO } = require('./municipio.model')

const LOCALIDAD = 'localidad'

const localidad_schema = {
  id_localidad: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  nombre_localidad: {
    allowNull: false,
    type: DataTypes.TEXT
  },
  id_municipio: {
    field: 'id_municipio',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: MUNICIPIO,
      key: 'id_municipio'
    }
  }
}

class Localidad extends Model{
  static associate(models){
    // Tenemos muchos dentro de nuestra tabla localidad tenemos municipios con la referencia de id_municipio
    this.hasMany(models.Localidad, { as: 'municipio', foreignKey: 'id_municipio' })
    // Relacion donde exportamos localidad le pertenecera a cliente
    // Especificiamos que pertenece al modelo cliente, donde cliente tiene la foreignkey de id_localidad
    this.belongsTo(models.Cliente, { as: 'cliente', foreignKey: 'id_localidad'})

  }

  static config(sequelize){
    return {
      sequelize,
      tableName: LOCALIDAD,
      modelName: 'Localidad',
      timestamps: false
    }
  }
}


// Exportar tabla, esquema y modelo
module.exports = { LOCALIDAD, localidad_schema, Localidad }
