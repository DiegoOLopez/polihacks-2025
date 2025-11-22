const { Model, DataTypes, Sequelize } = require('sequelize')
const { ESTADO } = require('./estado.model')

const MUNICIPIO = 'municipio'

const municipio_schema = {
  id_municipio: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  nombre_municipio: {
    allowNull: false,
    type: DataTypes.TEXT
  },
  id_estado: {
    field: 'id_estado',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: ESTADO,
      key: 'id_estado'
    }
  }
}

class Municipio extends Model{
  static associate(models){
    this.hasMany(models.Municipio, { as: 'estado', foreignKey: 'id_estado' })
    // Relacion donde municipio le pertenecera a localidad
    // Especificiamos que pertenece al modelo localidad, donde localidad tiene la foreignkey de id_municipio
    this.belongsTo(models.Localidad, { as: 'localidad', foreignKey: 'id_municipio'})

  }

  static config(sequelize){
    return {
      sequelize,
      tableName: MUNICIPIO,
      modelName: 'Municipio',
      timestamps: false
    }
  }
}


// Exportar tabla, esquema y modelo
module.exports = { MUNICIPIO, municipio_schema, Municipio }
