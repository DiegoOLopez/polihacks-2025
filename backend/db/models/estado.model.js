const { Model, DataTypes, Sequelize } = require('sequelize')

const ESTADO = 'estado'

const estado_schema = {
  id_estado: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  nombre_estado: {
    allowNull: false,
    type: DataTypes.TEXT
  }
}

class Estado extends Model{
  static associate(models){
    this.belongsTo(models.Municipio, { as: 'municipio', foreignKey: 'id_estado'})
  }

  static config(sequelize){
    return {
      sequelize,
      tableName: ESTADO,
      modelName: 'Estado',
      timestamps: false
    }
  }
}


// Exportar tabla, esquema y modelo
module.exports = { ESTADO, estado_schema, Estado }
