const { Model, DataTypes, Sequelize } = require('sequelize')

const ANIO = 'anio'

const anio_schema = {
  id_anio:{
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  }
}

class Anio extends Model{
  static associate(models){
    this.belongsTo(models.Pago, { as: 'pago', foreignKey: 'id_anio'})
  }

  static config(sequelize){
    return {
      sequelize,
      tableName: ANIO,
      modelName: 'Anio',
      timestamps: false
    }
  }
}

// Exportar tabla, esquema y modelo
module.exports = { ANIO, anio_schema, Anio }
